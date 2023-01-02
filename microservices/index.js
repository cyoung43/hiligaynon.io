// AWS SDK config
const AWS = require('aws-sdk')
const AWS_REGION = 'us-east-1'
const TABLE = process.env.TABLE
const KEY = process.env.PRIMARY_KEY

AWS.config.update({
    region: AWS_REGION
})

// TEST COMMENT FOR WORKFLOW
// They use dynamodbclient in this API gateway tutorial vs the AWS.DynamoDB.DocumentClient()... why?
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_lib_dynamodb.html

// Constants
const dynamo_db = new AWS.DynamoDB.DocumentClient()
const HEALTH_PATH = '/health'
const WORDS_PATH = '/words'
const WORD_PATH = '/word'

exports.handler = async function (event, context, callback) {
    // console.log('Request event', event)
    
    const request_body = event.body

    console.log('Request body', request_body)

    const { word, search } = request_body

    try {
        const data = await get_word(word, search)
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
            sort: search
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