import { getQuantity } from './products/[productId]/actions';
import styles from './totalNumber.module.css';

export default async function TotalNumber() {
  const currentProducts = await getQuantity();
  const total = currentProducts.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return <p className={styles.totalNumber}>{total}</p>;
}
