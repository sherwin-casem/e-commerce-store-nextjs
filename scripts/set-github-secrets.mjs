import fs from 'node:fs';
import { config } from 'dotenv';
import sodium from 'tweetsodium';

config();

const postgresUrl = process.env.POSTGRES_URL;
const postgresUrlDirect = process.env.POSTGRES_URL_DIRECT;

if (!postgresUrl) {
  console.error('POSTGRES_URL is missing from .env');
  process.exit(1);
}

const remoteUrl = process.env.GITHUB_REMOTE_URL;
const tokenMatch = remoteUrl?.match(/ghp_[A-Za-z0-9]+/);
const token = tokenMatch?.[0];

if (!token) {
  console.error('Could not find GitHub token in git remote URL.');
  process.exit(1);
}

const repo = 'sherwin-casem/e-commerce-store-nextjs';

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${path} failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function encryptSecret(publicKey, secretValue) {
  const key = Buffer.from(publicKey, 'base64');
  const messageBytes = Buffer.from(secretValue);
  const encryptedBytes = sodium.seal(messageBytes, key);
  return Buffer.from(encryptedBytes).toString('base64');
}

async function setRepoSecret(name, value) {
  const { key, key_id: keyId } = await githubRequest(
    `/repos/${repo}/actions/secrets/public-key`,
  );

  await githubRequest(`/repos/${repo}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      encrypted_value: encryptSecret(key, value),
      key_id: keyId,
    }),
  });

  console.log(`Set GitHub secret: ${name}`);
}

async function main() {
  await setRepoSecret('POSTGRES_URL', postgresUrl);

  if (postgresUrlDirect) {
    await setRepoSecret('POSTGRES_URL_DIRECT', postgresUrlDirect);
  }

  console.log('GitHub secrets updated.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
