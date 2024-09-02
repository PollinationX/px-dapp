import Sidebar from '@/components/drive/sidebar'
import { FC, ReactNode } from 'react'
import { INft } from '@/types'

interface ILayoutProps {
  children: ReactNode
  nfts?: INft[]
}

const Layout: FC<ILayoutProps> = ({ children, nfts }) => {
  return (
    <div>
      <Sidebar nfts={nfts} />
      {children}
    </div>
  )
}
export default Layout
