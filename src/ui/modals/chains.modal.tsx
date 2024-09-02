import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { Modal, Tabs, Tooltip } from 'flowbite-react'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { HiCheck } from 'react-icons/hi'
interface IChainsModalProps {
  show: boolean
  onClose: any
}

const ChainsModal: FC<IChainsModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation()
  const { chain: currentChain } = useNetwork()
  const { chains, switchNetwork } = useSwitchNetwork()

  const isCurrentChainSupported = chains.some(chain => chain.id === (currentChain?.id || 0))

  const isTestnetDomain = typeof window !== 'undefined' && window.location.hostname.includes('testnet')

  return (
    <>
      <Modal show={show} position='center' onClose={() => onClose(true)}>
        <Modal.Header className='dark:bg-neutral-800 dark:border-gray-700 modalHeader'>{t('selectNetwork')}</Modal.Header>
        <Modal.Body
          className='border-t  dark:border-gray-600 bg-white dark:bg-gradient-to-b
                                                    from-pollinationx-black to-pollinationx-purple'
        >
          <div className='space-y-6 p-3 overflow-x-scroll '>
            {!isCurrentChainSupported && (
              <div className='w-full items-center justify-between'>
                <h3 className='font-heading text-lg font-medium items-center justify-between text-center leading-6 text-muted-900 dark:text-white'>
                  {t('selectSupportedNetwork')}
                </h3>
              </div>
            )}

            <Tabs.Group style='default' className='tabsItem'>
              {isTestnetDomain ? (
                <Tabs.Item active={true} title={t('testnet')}>
                  <div className='grid grid-cols-4 gap-2'>
                    {chains.map(
                      chain =>
                        chain.testnet && (
                          <div key={chain.id} className='relative my-4 flex items-center justify-center'>
                            <Tooltip
                              content={chain.name}
                              animation='duration-500'
                              className='bg-pollinationx-black dark:bg-pollinationx-black opacity-90'
                              placement='top'
                              arrow={false}
                            >
                              <div className='relative'>
                                <input
                                  type='radio'
                                  name='language_selection'
                                  className='peer absolute start-0 top-0 z-20 h-full w-full cursor-pointer opacity-0'
                                  checked={chain.id === (currentChain?.id || 0)}
                                  onClick={() => switchNetwork(chain.id)}
                                />
                                <div className='flex h-14 w-14 items-center justify-center rounded-full border-2 border-muted-200 shadow-lg transition-all duration-300 dark:border-muted-600'>
                                  <img className='h-10 w-10 rounded-full' src={`/img/chains/${chain.id}.svg`} alt={`${chain.name} icon`} />
                                </div>
                                <div
                                  className={`absolute -end-1 -top-1 ${
                                    chain.id === (currentChain?.id || 0) ? 'flex' : 'hidden'
                                  } h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-pollinationx-purple text-white dark:border-muted-800`}
                                >
                                  <HiCheck />
                                </div>
                              </div>
                            </Tooltip>
                          </div>
                        )
                    )}
                  </div>
                </Tabs.Item>
              ) : (
                <Tabs.Item active={true} title={t('mainnet')}>
                  <div className='grid grid-cols-4 gap-2'>
                    {chains.map(
                      chain =>
                        !chain.testnet && (
                          <div key={chain.id} className='relative my-4 flex items-center justify-center'>
                            <div className='relative' data-nui-tooltip={chain.name}>
                              <input
                                type='radio'
                                name='language_selection'
                                className='peer absolute start-0 top-0 z-20 h-full w-full cursor-pointer opacity-0'
                                checked={chain.id === (currentChain?.id || 0)}
                                onClick={() => switchNetwork(chain.id)}
                              />
                              <div className='flex h-14 w-14 items-center justify-center rounded-full border-2 border-muted-200 shadow-lg transition-all duration-300 dark:border-muted-600'>
                                <img className='h-10 w-10 rounded-full' src={`/img/chains/${chain.id}.svg`} alt={`${chain.name} icon`} />
                              </div>
                              <div
                                className={`absolute -end-1 -top-1 ${
                                  chain.id === (currentChain?.id || 0) ? 'flex' : 'hidden'
                                } h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-green-700 text-white dark:border-muted-800`}
                              >
                                <HiCheck />
                              </div>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                </Tabs.Item>
              )}
            </Tabs.Group>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ChainsModal
