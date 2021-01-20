require('dotenv').config()
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')


/*Postman valitti
CORS Error: The request has been blocked because of the CORS policy
Errorista pääsee eroon alla olevilla kahdella rivillä*/
const cors = require('cors')
app.use(cors())

app.use(express.json())
app.use(express.static('build'))


person: morgan.token("person", (req, res) => {
    const p = { "name": req.body.name, "number": req.body.number }
    return JSON.stringify(p);
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :person"))

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (req, res) => {
    Person.countDocuments()
        .then(response => {
            res.send(`<div>
        <p>Phonebook has info for ${response} people</p>
        <p>${Date()}</p>
        </div>`)
        })
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {
                res.status(404).end()
            }
        }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res) => {

    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)


const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

