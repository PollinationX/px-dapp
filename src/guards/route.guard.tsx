import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { useAccountContext } from '@/contexts/account/provider'
import { authGuardOptions } from '@/config'

const RouteGuard = ({ children }) => {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { account } = useAccountContext()
  const [authorized, setAuthorized] = useState(false)

  const handleMetamaskChanges = () => {
    window.ethereum.on('accountsChanged', () => {
      window.location.href = `/${router.locale != router.defaultLocale ? router.locale : ''}`
    })
    window.ethereum.on('chainChanged', () => {
      window.location.href = `/${router.locale != router.defaultLocale ? router.locale : ''}`
    })
  }

  useEffect(() => {
    authCheck(router.route)
    const hideContent = () => setAuthorized(false)
    router.events.on('routeChangeStart', hideContent)
    router.events.on('routeChangeComplete', authCheck)
    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', authCheck)
    }
  }, [isConnected])

  const authCheck = (url: string) => {
    const path = url.split('?')[0]
    if (authGuardOptions.publicPaths.includes(path) || (isConnected && account.loggedIn)) {
      !account.loggedIn || handleMetamaskChanges()
      setAuthorized(true)
    } else {
      setAuthorized(false)
      window.location.href = `/${router.locale != router.defaultLocale ? router.locale : ''}`
    }
  }

  return authorized && children
}

export default RouteGuard
