import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Redis from 'ioredis'
import { useState } from 'react'

let redis = new Redis(process.env.REDIS_URL)

function Footer(props) {
	const { nodeName, styles } = props
	const provider = nodeName.startsWith("general-") ? "Symbiosis" : "DigitalOcean"

	return <footer className={styles.footer}>
		This app is running on {provider}
  	</footer>
}

function Guestbook({props}) {
	const { guestbookData }  = props
	const [name, setName] = useState('')
	const [guestbook, setGuestbook] = useState(guestbookData)
	const [message, setMessage] = useState('')

	const sign = async () => {
		if (name === '') {
			setMessage(<p className='red'>Name cannot be empty</p>)
			return
		}
		const response = await fetch('/api/guestbook', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({name})
		})
		const data = await response.json()
		setGuestbook(data.guestbook)
		setName('')
		setMessage(<p>Thank you for signing our guestbook {name}</p>)
	}

	return (
		<div className='signed'>
			<h2>Guestbook:</h2>

			{ guestbook.length > 0 ?
				<ul>
					{guestbook.map(s => <li key={s.name}>{s.name}</li>)}
				</ul> : 'Be the first to sign our guestbook'
			}

			<div className='guestbook-form'>
			{ message ? <h4>{message}</h4> : '' }
			Name: <input type='text' value={name} onChange={ e => setName(e.target.value) }/> <input type='button' value="Sign guestbook" onClick={sign} />
			</div>
		</div>
	)

}

export default function Home({ data }) {


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to my website
        </h1>
		<Guestbook props={data}/>
      </main>

      <Footer styles={styles} nodeName={data.nodeName}/>
    </div>
  )
}

export async function getServerSideProps() {
  const list = await redis.lrange("guestbook", 0, -1)
  const guestbookData = list.map(e => JSON.parse(e))
  const nodeName = process.env.NEXT_PUBLIC_NODE_NAME || ""
  return { props: { data: {guestbookData, nodeName} } }
}
