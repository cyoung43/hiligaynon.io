// docs: https://github.com/aws/aws-sdk-js-v3/blob/main/lib/lib-dynamodb/README.md
// imports
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    GetCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb"

const TABLE = process.env.TABLE
const KEY = process.env.PRIMARY_KEY

// TEST COMMENT FOR WORKFLOW
// They use dynamodbclient in this API gateway tutorial vs the AWS.DynamoDB.DocumentClient()... why?
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_lib_dynamodb.html

// Constants
const client = new DynamoDBClient({ region: 'us-east-1' })
const dynamo = DynamoDBDocumentClient.from(client)
const HEALTH_PATH = '/health'
const WORDS_PATH = '/words'
const WORD_PATH = '/word'

export const handler = async function (event, context, callback) {
    // console.log('Request event', event)
    
    const request_body = event.body

    console.log('Request body', request_body)

    try {
        const { Item } = await get_word(request_body)
        console.log('data', Item)

        return { body: JSON.stringify(Item) }
    }
    catch (err) {
        return { error: err }
    }
}

const get_word = async ({ word, sort }) => {
    const params = {
        TableName: TABLE,
        Key: {
            word,
            sort
        }
    }

    try {
        const data = await dynamo.send(
            new GetCommand(params)
        )

        return data
    }
    catch (err) {
        return err
    }
}