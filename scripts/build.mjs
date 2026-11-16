/** Build the static catalog used by GitHub Pages. No dependencies required. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const recipeDir = path.join(root, 'content', 'recipes');
const encyclopediaDir = path.join(root, 'content', 'encyclopedia');
const outFile = path.join(root, 'data', 'catalog.js');
const checkOnly = process.argv.includes('--check');
const allowed = {
  base: ['琴酒', '龍舌蘭', '蘭姆酒', '威士忌', '伏特加', '氣泡酒'],
  difficulty: ['入門', '中等', '進階'],
  method: ['直調', '搖盪', '攪拌'],
  vessel: ['rocks', 'coupe', 'highball', 'wine'],
  garnish: ['orange', 'lime', 'lemon', 'coffee', 'cherry', 'mint', 'none'],
  flavors: ['苦甜', '草本', '酸爽', '柑橘', '清新', '甜潤', '果香', '咖啡', '氣泡', '濃郁']
};
const requireString = (v, field, file) => {
  if (typeof v !== 'string' || !v.trim()) throw new Error(`${file}: ${field} must be a nonempty string`);
};
const checkList = (v, field, file) => {
  if (!Array.isArray(v) || !v.length || v.some(x => typeof x !== 'string' || !x.trim())) {
    throw new Error(`${file}: ${field} must be a nonempty array of nonempty strings`);
  }
};
const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { throw new Error(`${path.relative(root, file)}: invalid JSON (${e.message})`); }
};
const files = fs.readdirSync(recipeDir).filter(f => f.endsWith('.json')).sort();
if (!files.length) throw new Error('No recipes found.');
const seenIds = new Set();
const seenOrders = new Set();
const recipes = files.map(file => {
  const c = readJson(path.join(recipeDir, file));
  for (const k of ['id', 'name', 'nameZh', 'subtitle', 'description', 'base', 'difficulty', 'method', 'glass', 'liquid', 'vessel', 'garnish', 'tip']) requireString(c[k], k, file);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id) || `${c.id}.json` !== file) throw new Error(`${file}: id must match kebab-case filename`);
  if (seenIds.has(c.id)) throw new Error(`${file}: duplicate id`);
  seenIds.add(c.id);
  for (const field of ['base', 'difficulty', 'method', 'vessel', 'garnish']) {
    if (!allowed[field].includes(c[field])) throw new Error(`${file}: unsupported ${field} = ${c[field]}`);
  }
  if (!/^#[\da-fA-F]{6}$/.test(c.liquid)) throw new Error(`${file}: liquid must be 6-digit hex color`);
  checkList(c.flavors, 'flavors', file);
  if (c.flavors.length > 3 || c.flavors.some(f => !allowed.flavors.includes(f))) throw new Error(`${file}: invalid flavor(s)`);
  if (!Number.isInteger(c.order) || c.order < 1 || seenOrders.has(c.order)) throw new Error(`${file}: order must be a unique positive integer`);
  seenOrders.add(c.order);
  if (!Number.isInteger(c.prepMinutes) || c.prepMinutes < 1 || c.prepMinutes > 120) throw new Error(`${file}: invalid prepMinutes`);
  if (!Array.isArray(c.ingredients) || c.ingredients.length < 2) throw new Error(`${file}: need at least two ingredients`);
  for (const ing of c.ingredients) {
    requireString(ing.name, 'ingredient.name', file);
    requireString(ing.unit, 'ingredient.unit', file);
    if (ing.amount !== null && (typeof ing.amount !== 'number' || ing.amount <= 0)) throw new Error(`${file}: invalid ingredient amount`);
  }
  checkList(c.steps, 'steps', file);
  if (c.steps.length < 2) throw new Error(`${file}: at least two steps required`);
  if (!c.source || typeof c.source !== 'object') throw new Error(`${file}: source is required`);
  requireString(c.source.label, 'source.label', file);
  requireString(c.source.url, 'source.url', file);
  if (!/^https:\/\//.test(c.source.url)) throw new Error(`${file}: source.url must use https`);
  return c;
});
recipes.sort((a,b) => a.order - b.order);
const ingredientFile = path.join(encyclopediaDir, 'ingredients.json');
const storyFile = path.join(encyclopediaDir, 'stories.json');
const relationFile = path.join(encyclopediaDir, 'relations.json');
const ingredients = readJson(ingredientFile);
const stories = readJson(storyFile);
const relations = readJson(relationFile);
if (!Array.isArray(ingredients) || !ingredients.length) throw new Error('ingredients.json must contain entries');
if (!Array.isArray(stories) || !stories.length) throw new Error('stories.json must contain entries');
const ingredientIds = new Set();
for (const ingredient of ingredients) {
  for (const field of ['id', 'name', 'nameZh', 'category', 'summary', 'history']) requireString(ingredient[field], `ingredient.${field}`, 'ingredients.json');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(ingredient.id) || ingredientIds.has(ingredient.id)) throw new Error(`ingredients.json: invalid or duplicate id ${ingredient.id}`);
  ingredientIds.add(ingredient.id);
  checkList(ingredient.flavors, `ingredient ${ingredient.id}.flavors`, 'ingredients.json');
  checkList(ingredient.uses, `ingredient ${ingredient.id}.uses`, 'ingredients.json');
  checkList(ingredient.relatedIngredientIds, `ingredient ${ingredient.id}.relatedIngredientIds`, 'ingredients.json');
  if (!Array.isArray(ingredient.sources) || !ingredient.sources.length) throw new Error(`ingredients.json: ${ingredient.id} needs sources`);
  ingredient.sources.forEach(source => {
    requireString(source.label, 'source.label', 'ingredients.json');
    requireString(source.url, 'source.url', 'ingredients.json');
    if (!/^https:\/\//.test(source.url)) throw new Error(`ingredients.json: ${ingredient.id} source must use https`);
  });
}
for (const ingredient of ingredients) {
  ingredient.relatedIngredientIds.forEach(id => {
    if (!ingredientIds.has(id)) throw new Error(`ingredients.json: ${ingredient.id} references missing ingredient ${id}`);
  });
}
const recipeIds = new Set(recipes.map(recipe => recipe.id));
const storyIds = new Set();
for (const story of stories) {
  for (const field of ['id', 'cocktailId', 'title', 'subtitle', 'imageCocktailId']) requireString(story[field], `story.${field}`, 'stories.json');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.id) || storyIds.has(story.id)) throw new Error(`stories.json: invalid or duplicate id ${story.id}`);
  storyIds.add(story.id);
  if (!recipeIds.has(story.cocktailId) || !recipeIds.has(story.imageCocktailId)) throw new Error(`stories.json: ${story.id} references missing cocktail`);
  if (!Array.isArray(story.sections) || story.sections.length < 3) throw new Error(`stories.json: ${story.id} needs at least 3 sections`);
  story.sections.forEach(section => {
    for (const field of ['title', 'body', 'type']) requireString(section[field], `story ${story.id}.section.${field}`, 'stories.json');
  });
  if (!Array.isArray(story.relatedCocktailIds) || story.relatedCocktailIds.some(id => !recipeIds.has(id))) throw new Error(`stories.json: invalid related cocktail in ${story.id}`);
  if (!Array.isArray(story.sources) || !story.sources.length) throw new Error(`stories.json: ${story.id} needs sources`);
  story.sources.forEach(source => {
    requireString(source.label, 'source.label', 'stories.json');
    requireString(source.url, 'source.url', 'stories.json');
    if (!/^https:\/\//.test(source.url)) throw new Error(`stories.json: ${story.id} source must use https`);
  });
}
for (const recipe of recipes) {
  const relation = relations[recipe.id];
  if (!relation) throw new Error(`relations.json: missing relation for ${recipe.id}`);
  if (relation.storyId && !storyIds.has(relation.storyId)) throw new Error(`relations.json: ${recipe.id} references missing story`);
  if (!Array.isArray(relation.ingredientIds) || relation.ingredientIds.some(id => !ingredientIds.has(id))) throw new Error(`relations.json: invalid ingredients for ${recipe.id}`);
  if (!Array.isArray(relation.relatedCocktailIds) || relation.relatedCocktailIds.some(id => !recipeIds.has(id) || id === recipe.id)) throw new Error(`relations.json: invalid related cocktails for ${recipe.id}`);
}
const result = `// GENERATED from content/recipes/*.json and content/encyclopedia/*.json by node scripts/build.mjs; do not edit directly.\nwindow.COCKTAIL_CATALOG = ${JSON.stringify(recipes, null, 2)};\nwindow.INGREDIENT_CATALOG = ${JSON.stringify(ingredients, null, 2)};\nwindow.STORY_CATALOG = ${JSON.stringify(stories, null, 2)};\nwindow.COCKTAIL_RELATIONS = ${JSON.stringify(relations, null, 2)};\n`;
if (checkOnly) {
  if (!fs.existsSync(outFile) || fs.readFileSync(outFile, 'utf8') !== result) {
    console.error('Catalog needs rebuilding. Run: node scripts/build.mjs');
    process.exit(1);
  }
  console.log(`OK: ${recipes.length} recipes are valid; generated catalog is up to date.`);
} else {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, result);
  console.log(`Built ${recipes.length} recipes -> data/catalog.js`);
}
