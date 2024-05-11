import express, {Request, Response} from "express"
const app = express()

const PORT = process.env.PORT || 8000

app.get("/", (req : Request, res : Response) => {
    return res.send("Hello World")
})

app.listen(8000, () => {
    console.log(`Server running on port ${PORT}`)
})