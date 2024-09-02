import axios, { AxiosInstance } from 'axios'
// import { stream } from 'stream'
import tarStream from 'tar-stream'

type FileInput = File // Or the actual type if it's not File
class RemoteStorageProvider {}

interface Headers {
  // Assuming headers are key-value pairs
  [key: string]: string
}

const extract = tarStream.extract

// Use the appropriate return type if it's not ArrayBuffer
function concatenateArrayBuffers(...chunks: ArrayBuffer[]): ArrayBuffer {
  const totalLength = chunks.reduce((total, arr) => total + arr.byteLength, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const arr of chunks) {
    result.set(new Uint8Array(arr), offset)
    offset += arr.byteLength
  }

  return result.buffer
}
export class PollinationX extends RemoteStorageProvider {
  private readonly client: AxiosInstance

  constructor(baseURL: string, token: string) {
    super()

    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  public async upload(file: FileInput, fileName?: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post('add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.loaded && progressEvent.total) {
          const percent = (progressEvent.loaded / progressEvent.total) * 100
        }
      }
    })

    if (!response.data.Hash) {
      throw new Error('An error occurred during uploading')
    }

    return response.data.Hash
  }

  // public async download(url: string): Promise<ArrayBuffer> {
  //   const urlObj = new URL(url)
  //   const response = await this.client.post('get', null, {
  //     params: {
  //       arg: urlObj.pathname
  //     },
  //     responseType: 'arraybuffer'
  //   })
  //
  //   return new Promise(resolve => {
  //     const tarExtract = extract()
  //     const chunks: ArrayBuffer[] = []
  //
  //     tarExtract.on('entry', (header: Headers, stream: stream.Readable, next: (error?: unknown) => void) => {
  //       if (header.type === 'file') {
  //         stream.on('data', chunk => {
  //           chunks.push(chunk)
  //         })
  //
  //         stream.on('end', () => {
  //           resolve(concatenateArrayBuffers(...chunks))
  //           next()
  //         })
  //       } else {
  //         stream.resume()
  //       }
  //     })
  //
  //     tarExtract.end(Buffer.from(response.data))
  //   })
  // }
}
