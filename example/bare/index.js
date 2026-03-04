import RPC from 'bare-rpc'
import { connect } from '#app'
import Console from 'bare-console'

const console = new Console()

const COMMANDS = { CLICK: 1 }

const startTime = Date.now()
let totalClicks = 0

connect((socket) => {
  let sessionClicks = 0

  const rpc = new RPC(socket, (req) => {
    if (req.command === COMMANDS.CLICK) {
      // click
      totalClicks++
      sessionClicks++
      const uptime = ((Date.now() - startTime) / 1000).toFixed(1)
      const response = JSON.stringify({
        session: sessionClicks,
        total: totalClicks,
        uptime,
      })
      console.log('click ->', response)
      req.reply(response)
    }
  })
})
