import logo from '../../assets/logo.svg'
import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <img src={logo} alt="Snow&Cia" className={styles.logo} />
      <h1 className={styles.title}>Calculadora de hospedagem</h1>
    </header>
  )
}
