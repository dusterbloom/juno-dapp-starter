import { useRouter } from 'next/router'

const Obligation = () => {
  const router = useRouter()
  const { id } = router.query

  return <p>Obligation: {id}</p>
}

export default Obligation
