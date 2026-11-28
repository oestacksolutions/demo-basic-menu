import { useIdioma } from '../context/useIdioma'

export default function NoEncontrado() {
  const { t } = useIdioma()
  return (<main className="contenedor"><h1>{t('noEncontradoTitulo')}</h1><p>{t('noEncontradoSub')}</p></main>)
}
