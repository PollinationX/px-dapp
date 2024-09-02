import Box from '@mui/material/Box'
import { FC } from 'react'
import { Backdrop } from '@mui/material'
import { Spinner } from 'flowbite-react'

interface ISyncBackdropProps {
  open: boolean
  text: string
}

const SyncBackdrop: FC<ISyncBackdropProps> = ({ open, text }) => {
  return (
    <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={open}>
      <Box sx={{ width: '300px' }}>
        <div className='text-center'>
          <Spinner className='mr-3' />
          {text}
        </div>
      </Box>
    </Backdrop>
  )
}

export default SyncBackdrop
