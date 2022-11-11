// AWS SDK config
const AWS = require('aws-sdk')
const AWS_REGION = 'us-east-1'
const TABLE = process.env.TABLE
const KEY = process.env.PRIMARY_KEY

AWS.config.update({
    region: AWS_REGION
})

// Constants
const dynamo_db = new AWS.DynamoDB.DocumentClient()
const HEALTH_PATH = '/health'
const WORDS_PATH = '/words'
const WORD_PATH = '/word'

exports.handler = async function (event) {
    console.log('Request event', event)
    let response

    switch (true) {
        case event.httpMethod === 'GET' && event.path === HEALTH_PATH:
            response = buildResponse(200)
            break
        case event.httpMethod === 'GET' && event.path === WORDS_PATH:
            response = await getWords()
            break
        case event.httpMethod === 'GET' && event.path === WORD_PATH:
            response = await getWord(event.queryStringParameters.word_id)
            break
        default:
            response = buildRespose(404, '404 not found')
    }

    return response
}

// Get all words
const getWords = async () => {
    const params = { TableName: TABLE }
    const all_words = await scanDynamoDbRecords(params, [])
    const body = {
        words: all_words
    }

    return buildResponse(200, body)
}

const scanDynamoDbRecords = async (scan_params, item_array) => {
    try {
        // Read Dynamo DB data, pushing into array
        const data = await dynamo_db.scan(scan_params).promise()
        item_array = [...item_array, ...data.Items]

        if (data.LastEvaluatedKey) {
            scan_params.ExclusiveStartKey = data.LastEvaluatedKey
            return await scanDynamoDbRecords(scan_params, item_array)
        }

        return item_array
    }

    catch (err) {
        console.log('ERROR in scan DynamoDB records', err)
    }
}

// Get specific word
const getWord = async (word_id) => {
    const params = {
        TableName: TABLE,
        Key: {
            key: word_id
        }
    }

    return await dynamo_db
        .get(params)
        .promise()
        .then((response) => {
            return buildResponse(200, response.Item)
        }, (err) => {
            console.log('ERROR', err)
        })
}

// Response helper
const buildResponse = (status_code, body) => {
    return {
        status_code,
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(body)
    }
}