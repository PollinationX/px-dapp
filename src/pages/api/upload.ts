import { NextApiRequest, NextApiResponse } from 'next'
import { pollinationX } from '@pollinationx/core'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    pollinationX.init({
      url: req.body.url,
      token: req.body.token
    })
    const hash = await pollinationX.upload(Buffer.from(req.body.content.split(';base64,').pop(), 'base64'), req.body.name, req.body?.secret)
    res.status(200).json({ hash })
  } catch (error) {
    res.status(400).json({ error })
  }
}

export default handler
