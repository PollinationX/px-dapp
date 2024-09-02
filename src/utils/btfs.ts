import { IGetContentByCid, IGetNft } from '@/types'
import { doSignMessage } from '@/utils/contract'
import { pollinationXConfig } from '@/config'
import { httpClient } from '@/utils/client'

const v2Chains = ['0x2803', '0xfa2', '0xc1c', '0xfa', '0x5afe', '0x79a']

export const getNfts = async (address: string): Promise<IGetNft> => {
  try {
    const { chain, nonce, signature } = await doSignMessage(pollinationXConfig.newNft.message)
    const endpoint = v2Chains.includes(chain) ? '/auth/v2/login' : 'https://6cp0k0.pollinationx.io/auth/login'

    return (
      await httpClient.get(endpoint, {
        params: {
          wallet: address,
          chain,
          nonce,
          signature
        }
      })
    ).data
  } catch (error) {
    return { error }
  }
}
export const getUsageState = async (token: string) => {
  try {
    const response = await httpClient.get('/auth/v2/usageState', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    return { error }
  }
}
export const setUpdateState = async (token: string) => {
  try {
    const response = await httpClient.get('/auth/v2/updateStaten', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  } catch (error) {
    return { error }
  }
}
export const getContentByCid = async (cid: string, token: string): Promise<IGetContentByCid> => {
  try {
    const content = await httpClient.post('/api/v1/cat', null, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        arg: cid
      },
      responseType: 'arraybuffer'
    })
    return { content: new TextDecoder('utf-8').decode(content.data) }
  } catch (error) {
    return { error }
  }
}
