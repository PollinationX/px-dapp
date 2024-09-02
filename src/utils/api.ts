import axios from 'axios'
import { HttpMethodEnum } from '@/enums/http-method.enum'

export const callApi = async (url: string, data: any, method = HttpMethodEnum.POST): Promise<any> => {
  try {
    return (
      await axios({
        method,
        url,
        data
      })
    ).data
  } catch (error) {
    return { error }
  }
}
