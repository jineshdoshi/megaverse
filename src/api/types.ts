// Define types or interfaces if not already defined
export type Position = {
    row: number;
    column: number;
};

export type Goal = {
    goal: string[][];
};

export type AstralObjectName = 'POLYANET' | 'SOLOON' | 'COMETH';

export enum AstralObjectId {
    POLYANET = 0,
    SOLOON = 1,
    COMETH = 2
}

export type AstralObject = Record<AstralObjectName, AstralObjectId>;

export const astralObjectMapping: AstralObject = {
    'POLYANET': AstralObjectId.POLYANET,
    'SOLOON': AstralObjectId.SOLOON,
    'COMETH': AstralObjectId.COMETH
}

export type SoloonColor = 'blue' | 'red' | 'purple' | 'white';

export type ComethDirection = 'up' | 'down' | 'right' | 'left';

export type MegaverseMapContentObj = {
    type: AstralObjectId;
    color?: SoloonColor; // Only present if type is 1
    direction?: ComethDirection; // Only present if type is 2
};

export type MegaverseMapContent = (MegaverseMapContentObj | null)[][];

export type MegaverseMapData = {
    map: {
        _id: string;
        content: MegaverseMapContent;
        candidateId: string;
        phase: number;
        __v: number;
    };
};
