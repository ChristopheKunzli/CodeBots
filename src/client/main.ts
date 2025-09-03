import {Application} from 'pixi.js';

import {GameEngine} from './game_engine';


// const exampleRecipes: Recipe[] = [
//     {inputs: [{spriteName: "wood_log", quantity: 1}], output: {spriteName: "wood_plank", quantity: 4}},
//     {inputs: [{spriteName: "iron_ingot", quantity: 1}], output: {spriteName: "nail", quantity: 16}},
//     {inputs: [{spriteName: "wood_plank", quantity: 12}, {spriteName: "nail", quantity: 64}], output: {spriteName: "crate", quantity: 1}},
//     {inputs: [{spriteName: "stone", quantity: 8}, {spriteName: "coal", quantity: 2}, {spriteName: "iron_ore", quantity: 1}], output: {spriteName: "furnace_off", quantity: 1}},
//     {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "pickaxe", quantity: 1}},
//     {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 8}], output: {spriteName: "shovel", quantity: 1}},
//     {inputs: [{spriteName: "wood_plank", quantity: 3}, {spriteName: "iron_rod", quantity: 2}, {spriteName: "nail", quantity: 16}], output: {spriteName: "axe", quantity: 1}},
// ];

// const exampleCoreSteps: CoreStep[] = [
//     {
//         stepNumber: 1,
//         items: [
//             {spriteName: "wood_plank", currentGathered: 2500, goal: 2500},
//             {spriteName: "stone", currentGathered: 0, goal: 800},
//             {spriteName: "coal", currentGathered: 1843, goal: 3000},
//             {spriteName: "iron_ore", currentGathered: 0, goal: 5},
//             {spriteName: "iron_ingot", currentGathered: 515, goal: 3000},
//             {spriteName: "nail", currentGathered: 0, goal: 9000},
//             {spriteName: "crate", currentGathered: 0, goal: 50},
//             {spriteName: "furnace_off", currentGathered: 1, goal: 3},
//             {spriteName: "pickaxe", currentGathered: 1, goal: 1},
//             {spriteName: "shovel", currentGathered: 0, goal: 1},
//             {spriteName: "axe", currentGathered: 1, goal: 1},
//         ]
//     },
// ];

// const exampleChestItems: Item[] = [
//     {spriteName: "wood_plank", quantity: 32},
//     null,
//     {spriteName: "stone", quantity: 64},
//     {spriteName: "coal", quantity: 16},
//     {spriteName: "iron_ore", quantity: 8},
//     {spriteName: "iron_ingot", quantity: 4},
//     null,
//     {spriteName: "nail", quantity: 128},
//     {spriteName: "crate", quantity: 2},
//     {spriteName: "furnace_off", quantity: 1},
//     {spriteName: "pickaxe", quantity: 1},
//     null,
//     null,
//     null,
//     null,
//     null,
//     null,
//     {spriteName: "pickaxe", quantity: 1},
//     {spriteName: "shovel", quantity: 1},
//     null,
// ];

// const exampleItemBar: Item[] = [
//     {spriteName: "pickaxe", quantity: 1},
//     {spriteName: "shovel", quantity: 1},
//     null,
//     {spriteName: "stone", quantity: 64},
//     null,
//     null,
// ];

// const exampleCode: string =
//     "1Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n2Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n3Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n4Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n5Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n6Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n7Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n8Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n9Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n10Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n11Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n12Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n13Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n14Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n15Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n16Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n17Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood" +
//     "\n18Repeat:\n    go to zone 1\n    cut wood\n    go to chest 1\n    drop wood"
// ;
import { initDevtools } from '@pixi/devtools';


(async () => {
    // Create a new application
    const app = new Application();
    initDevtools({ app });
    // Initialize the application
    await app.init({
        background: '#1099bb',
        resizeTo: window,
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);
    const engine = new GameEngine(app);
    await engine.initialize();

    // const cameraX = 0;
    app.ticker.add((delta) => {
        // Suivre une position cible
        engine.update(delta.deltaTime);
    });

    // const guiScale = 64;
    // const spritesheets = await getSpritesheets();

    // const itemBar = new ItemBar(app, spritesheets, guiScale, exampleItemBar);
    // const chestInterface = new ChestInterface(app, spritesheets, guiScale, exampleChestItems);
    // const craftingInterface = new CraftingInterface(app, spritesheets, guiScale, exampleRecipes);
    // const coreInterface = new CoreInterface(app, spritesheets, guiScale, exampleCoreSteps);
    // const robotInterface = new RobotInterface(app, spritesheets, guiScale, exampleCode);

    //chestInterface.show();
    //craftingInterface.show();
    //coreInterface.show();
    //robotInterface.show();
    // itemBar.show();
})();
