import * as process from "process";
import { Megaverse } from "./api";
import { AstralObjectName, Position } from "./api";

const candidateId = process.env.CROSSMINT_CANDIDATE_ID;

if (!candidateId) {
    console.log('Please set CROSSMINT_CANDIDATE_ID in env.');
    process.exit(1);
}

// Initialize Megaverse instance
const megaverse = new Megaverse(candidateId as string);

// Function to execute actions based on user input
async function executeAction(action: string, args: string[]) {
    switch (action) {
        case 'add':
            const addAstralObjStr = args[0] as string;
            const addRow = parseInt(args[1] ?? '0');
            const addColumn = parseInt(args[2] ?? '0');
            await addAstralObject(addAstralObjStr, { row: addRow, column: addColumn });
            break;
        case 'remove':
            const rmAstralObjName = args[0] as AstralObjectName;
            const rmRow = parseInt(args[1] ?? '0');
            const rmColumn = parseInt(args[2] ?? '0');
            await removeAstralObject(rmAstralObjName, { row: rmRow, column: rmColumn });
            break;
        case 'validate':
            await validate();
            break;
        case 'reset':
            await reset();
            break;
        case 'create_goal':
            await createGoal();
            break;
        case 'exit':
            console.log('Thank you for playing Megaverse!')
            process.exit(0);
            break;
        default:
            console.error('Invalid action. Available actions: [add, remove, validate, create_goal, reset, exit].');
    }
}

async function addAstralObject(astralObjStr: string, position: Position) {
    const astralObject = megaverse.prepareAstralObject(astralObjStr, position);
    await megaverse.setAstralObject(astralObject.astralObjName, astralObject.position, astralObject.color, astralObject.direction);
}

// Function to delete an astral object
async function removeAstralObject(astralObjName: AstralObjectName, position: Position) {
    await megaverse.removeAstralObject(astralObjName, position);
}

// Function to validate the Megaverse
async function validate() {
    console.log('Validating Megaverse with its goal state...');
    await megaverse.validate().then(match => {
        if (match) {
            console.log('[Success] Megaverse state matches the goal state!');
        } else {
            console.log('[Failure] Megaverse state does not match the goal state!');
        }
    });
}

// Function to create full megaverse map of astral objects to match goal state
async function createGoal() {
    console.log('Creating Megaverse to match its goal state...');
    await megaverse.createGoalState();
}

// Function to reset the complete Megaverse to initial state
async function reset() {
    console.log('Resetting Megaverse to its initial state...');
    await megaverse.reset();
}

megaverse.initialize().then(() => {
    console.log('Megaverse initialized!');
    // Continuously listen for user input
    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', async (input) => {
        const [action, ...args] = input.toString().trim().split(' ');
        await executeAction(action, args);
    });

    console.log('Begin Megaverse. Available commands: [add, remove, validate, create_goal, reset, exit]');
    console.log('Waiting for your command...');
}).catch(error => {
    console.error('Megaverse Initialization failed: ', error);
});


