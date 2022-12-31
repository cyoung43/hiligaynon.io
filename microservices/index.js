// AWS SDK config
const AWS = require('aws-sdk')
const AWS_REGION = 'us-east-1'
const TABLE = process.env.TABLE
const KEY = process.env.PRIMARY_KEY

AWS.config.update({
    region: AWS_REGION
})

// take a look at the unicorn.js file

// Next step here could be either using the AWS course to build the serverless skills or justy trying to rework
// these javascript functions to figure it out. Idk yet what is better.

// Constants
const dynamo_db = new AWS.DynamoDB.DocumentClient()
const HEALTH_PATH = '/health'
const WORDS_PATH = '/words'
const WORD_PATH = '/word'

exports.handler = async function (event, context, callback) {
    // console.log('Request event', event)
    
    const request_body = event.body

    console.log('Request body', request_body)

    try {
        const data = await get_word('ádlaw')
        console.log('data', data)

        return { body: JSON.stringify(data) }
    }
    catch (err) {
        return { error: err }
    }
}

const get_word = async (word, search) => {
    const params = {
        TableName: TABLE,
        Key: {
            word,
            sort: '1'
        }
    }

    console.log('Params', params)

    try {
        const data = await dynamo_db.get(params).promise()

        return data
    }
    catch (err) {
        return err
    }
}