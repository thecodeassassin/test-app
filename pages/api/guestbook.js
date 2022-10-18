import Redis from 'ioredis'

let redis = new Redis(process.env.REDIS_URL)

export default async (req, res) => {

  if (req.method === 'POST') {
	const { body } = req
	await redis.rpush("guestbook", JSON.stringify(body))
  }

  const list = await redis.lrange("guestbook", 0, -1)
  const guestbook = list.map(e => JSON.parse(e))

  res.status(200).json({ guestbook })
}
