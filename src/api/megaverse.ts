import * as process from "process";
import {
    AstralObjectName,
    ComethDirection,
    Goal,
    MegaverseMapData,
    Position,
    SoloonColor
} from "./types";
import { getAstralObjectName } from "./utils";
import { axiosRetryRequestWithExponentialBackoff } from "../utils";

export class Megaverse {
    private readonly baseUrl: string = 'https://challenge.crossmint.io/api';
    private readonly candidateId: string;
    private goalMap!: Goal;

    constructor(candidateId: string) {
        this.candidateId = candidateId;
    }

    async initialize(): Promise<void> {
        if (!this.goalMap) {
            try {
                this.goalMap = await this.getGoalState();
                if (!this.goalMap || !this.goalMap.goal) {
                    throw Error('Megaverse goal undefined.')
                }
            } catch (error) {
                console.error('Error fetching goal map:', error);
                process.exit(1);
            }
        }
    }

    logAction(actionName: string, astralObjName: string, position: Position) {
        console.log(`${actionName} astral object: ${JSON.stringify({ name: astralObjName, ...position})}`)
    }

    logMismatch(astralObjName: string, position: Position) {
        console.log(`Invalid astral object: ${JSON.stringify({ 
            actual: astralObjName, 
            goal: this.goalMap.goal[position.row][position.column], 
            ...position
        })}`)
    }

    // Fetch the goal state of the Megaverse
    async getGoalState(): Promise<Goal> {
        try {
            return axiosRetryRequestWithExponentialBackoff<Goal>('GET', `${this.baseUrl}/map/${this.candidateId}/goal`);
        } catch (error) {
            throw Error(`Error fetching goal map: ${error}`)
        }
    }

    prepareAstralObject(
        astralObjectStr: string,
        position: Position) {
        let astralObjectName = 'POLYANET' as AstralObjectName;
        let color = undefined;
        let direction = undefined;

        if (astralObjectStr.includes('SOLOON')) {
            color = astralObjectStr.split('_')[0].toLowerCase() as SoloonColor;
            astralObjectName = astralObjectStr.split('_')[1] as AstralObjectName;
        }

        if (astralObjectStr.includes('COMETH')) {
            direction = astralObjectStr.split('_')[0].toLowerCase() as ComethDirection;
            astralObjectName = astralObjectStr.split('_')[1] as AstralObjectName;
        }

        return {
            astralObjName: astralObjectName,
            position: position,
            color: color,
            direction: direction
        }
    }

    // Set astral object at a position
    async setAstralObject(
        astralObjName: AstralObjectName,
        position: Position,
        color?: SoloonColor,
        direction?: ComethDirection
    ): Promise<void> {
        try {
            let requestBody: any = {
                candidateId: this.candidateId,
                ...position
            }

            if (astralObjName === 'SOLOON' && color) {
                requestBody['color'] = color;
            } else if (astralObjName === 'COMETH' && direction) {
                requestBody['direction'] = direction;
            }
            this.logAction('Set', astralObjName, position);
            await axiosRetryRequestWithExponentialBackoff<void>(
                'POST',
                `${this.baseUrl}/${astralObjName.toLowerCase()}s`,
                { data: requestBody }
            );
        } catch (error) {
            console.error(`Error setting astral object: ${astralObjName} at position: ${JSON.stringify(position)}:`, error);
        }
    }

    // Delete astral object at a position
    async removeAstralObject(astralObjName: AstralObjectName, position: Position): Promise<void> {
        try {
            const requestData = {
                candidateId: this.candidateId,
                ...position
            };
            this.logAction('Delete', astralObjName, position);
            await axiosRetryRequestWithExponentialBackoff<void>(
                'DELETE',
                `${this.baseUrl}/${astralObjName.toLowerCase()}s`,
                { data: requestData }
            );
        } catch (error) {
            console.error(`Error deleting ${astralObjName}:`, error);
        }
    }

    async getCurrentMap(): Promise<MegaverseMapData> {
        try {
            return axiosRetryRequestWithExponentialBackoff<MegaverseMapData>(
                'GET',
                `${this.baseUrl}/map/${this.candidateId}`
            );
        } catch(error) {
            throw Error(`Error getting latest megaverse map: ${error}`);
        }
}

    // Validate the Megaverse with Goal state
    async validate(): Promise<boolean> {
        try {
            const megaverseMapData = await this.getCurrentMap();
            const content = megaverseMapData.map.content;
            const goal = this.goalMap.goal;
            if (content.length !== goal.length) {
                return false;
            }

            // Check if each element of content matches the corresponding element in goal
            for (let i = 0; i < content.length; i++) {
                const row = content[i];
                // Check if row lengths match
                if (row.length !== goal[i].length) {
                    return false;
                }
                // Iterate through each element of the row
                for (let j = 0; j < row.length; j++) {

                    // SPACE in goal map should match null in current map
                    if (goal[i][j] === "SPACE" && row[j] === null) {
                        continue;
                    }
                    if (goal[i][j] !== "SPACE" && row[j] === null) {
                        this.logMismatch("", { row: i, column: j })
                        return false;
                    }

                    const actualAstralObjName = getAstralObjectName(row[j]!.type)!.toString()

                    let goalAstralObjName = goal[i][j]
                    let goalAstralObjColor = undefined
                    let goalAstralObjDirection = undefined

                    if (goal[i][j].includes('_') && goal[i][j].includes('SOLOON')) {
                        goalAstralObjName = goal[i][j].split('_')[1]
                        goalAstralObjColor = goal[i][j].split('_')[0]
                    }

                    if (goal[i][j].includes('_') && goal[i][j].includes('COMETH')) {
                        goalAstralObjName = goal[i][j].split('_')[1]
                        goalAstralObjDirection = goal[i][j].split('_')[0]
                    }

                    // astral object name should match
                    if (goalAstralObjName !== actualAstralObjName) {
                        this.logMismatch(actualAstralObjName, { row: i, column: j });
                        return false;
                    }

                    // astral object direction should match if exists
                    if (!!row[j]?.direction) {
                        if (!!goalAstralObjDirection && goalAstralObjDirection !== row[j]!.direction!.toUpperCase()) {
                            this.logMismatch(actualAstralObjName, { row: i, column: j });
                            return false
                        }
                    }

                    // astral object color should match if exists
                    if (!!row[j]?.color) {
                        if (!!goalAstralObjColor && goalAstralObjColor !== row[j]!.color!.toUpperCase()) {
                            this.logMismatch(goal[i][j], { row: i, column: j });
                            return false
                        }
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('Error validating map:', error);
            return false;
        }
    }

    // Reset the entire Megaverse
    async reset(): Promise<void> {
        try {
            const response = await this.getCurrentMap();
            const content = response.map.content;

            for (let i = 0; i < content.length; i++) {
                for (let j = 0; j < content[i].length; j++) {
                    const val = content[i][j];
                    if (val === null) {
                        continue;
                    }

                    const astralObjName = getAstralObjectName(val.type)!;
                    const position = { row: i, column: j }
                    await this.removeAstralObject(astralObjName, position);
                }
            }
        } catch (error) {
            console.error('Error resetting Megaverse:', error);
        }
    }

    // Reset the Megaverse and create the Goal state
    async createGoalState(): Promise<void> {
        await this.reset()
        for (let row = 0; row < this.goalMap.goal.length; row++) {
            for (let column = 0; column < this.goalMap.goal[row].length; column++) {
                const astralObjectStr = this.goalMap.goal[row][column].toUpperCase();
                if (astralObjectStr === 'SPACE') {
                    continue;
                }

                const position = { row, column };
                const astralObject = this.prepareAstralObject(astralObjectStr, position);

                await this.setAstralObject(
                    astralObject.astralObjName,
                    astralObject.position,
                    astralObject.color,
                    astralObject.direction
                );
            }
        }
    }
}