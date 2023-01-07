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
const ALL_WORDS = '/words'
const SINGLE_WORD = '/word'
const PREFIX = '/api/v1'

export const handler = async function (event, context, callback) {

    try {
        let body
        switch (event.routeKey) {
            case `GET ${PREFIX}${SINGLE_WORD}/{id}/{key}`:
                const { Item } = await get_word({ word: event.pathParameters.id, sort: event.pathParameters.key })
                if (!Item?.word) {
                    body = { error: `The word ${event.pathParameters.id} does not exist with the associated sort key (${event.pathParameters.key})`}
                }
                body = Item
                break
            case `GET ${PREFIX}${ALL_WORDS}`:
                const { Items } = await get_all_words()
                body = Items
                break
            case `GET ${PREFIX}${HEALTH_PATH}`:
                body = { message: 'Okay man gid ang API health di!' }
            default:
                body = { err: `Unsupported route ${event.routeKey}` }
                throw new Error(`Unsupported route: ${event.routeKey}`)
        }

        return { body }
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