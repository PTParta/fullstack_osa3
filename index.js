
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()


/*Postman valitti
CORS Error: The request has been blocked because of the CORS policy
Errorista pääsee eroon alla olevilla kahdella rivillä*/
const cors = require('cors')
app.use(cors())

app.use(express.json())


person: morgan.token("person", (req, res) => {
    const p = { "name": req.body.name, "number": req.body.number }
    return JSON.stringify(p);
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons', (req, res) => {
    //console.log('persons')
    res.json(persons)
})

app.get('/info', (req, res) => {
    //console.log('info')
    res.send(`
    <div>
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
    </div>`)
})

app.get('/api/persons/:id', (req, res) => {
    //console.log('id')
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    if (persons.find(person => person.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = body
    person.id = Math.floor(Math.random() * 1000)
    //console.log(person)

    persons = persons.concat(person)

    //console.log(persons)

    res.json(person)


})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

/* ReactDOM.render(
    <App />,-
    document.getElementById('root')
  ) */

