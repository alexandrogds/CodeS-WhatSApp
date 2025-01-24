import dotenv from 'dotenv'
import { appendFile, readFile, writeFile } from './myfs.js'

dotenv.config({ path: './.env' });
console.log(process.env.WINNERS_ARENA_SC)
let data = await readFile(process.env.WINNERS_ARENA_SC);
console.log(data)
let winnerData = JSON.parse(data)
console.log(winnerData)
