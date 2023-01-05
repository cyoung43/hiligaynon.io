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
    console.log('event', event)

    try {
        let body
        switch (event.routeKey) {
            case 'GET /word/{id}/{key}':
                const { Item } = await get_word({ word: event.pathParameters.id, sort: event.pathParameters.key })
                console.log('data', Item)
                body = Item
                break
            case 'GET /words':
                const { Items } = await get_all_words()
                body = Items
                break
            default:
                throw new Error(`Unsupported route: ${event.routeKey}`)
        }


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

const get_all_words = async () => {
    const params = {
        TableName: TABLE
    }

    try {
        const data = await dynamo.send(
            new ScanCommand(params)
        )

        return data
    }
    catch (err) {
        return err
    }
}