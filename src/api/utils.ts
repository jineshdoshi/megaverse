import {AstralObjectId, AstralObjectName} from "./types";

export function getAstralObjectName(id: AstralObjectId): AstralObjectName | null {
    if(id === AstralObjectId.POLYANET) return 'POLYANET' as AstralObjectName;
    if(id === AstralObjectId.SOLOON) return 'SOLOON' as AstralObjectName;
    if(id === AstralObjectId.COMETH) return 'COMETH' as AstralObjectName
    return null;
}