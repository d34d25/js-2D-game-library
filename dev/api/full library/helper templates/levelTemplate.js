import * as physics from "../../lib/physengine.js";
import * as render from "../../lib/simpleRender.js";
import * as levels from "../../lib/level.js";
import { testData } from "./levelsData.js";

const canvas = document.getElementById('myCanvas');

const loadedData = levels.loadLevelData(testData, canvas);

let testLevel = new levels.Levels(
    {
        player: loadedData.player,
        bodies: loadedData.bodies,
        entities: loadedData.bodyLessEntities,
        gravity: {x:0, y:550}
    }
)

testLevel.update = function(dt)
{

}

testLevel.render = function(ctx)
{
    
}

function renderScene(ctx)
{

}

export default testLevel;