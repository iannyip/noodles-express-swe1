// Import module
import express from 'express';
import { read } from './jsonFileStorage.js';

// Declare setup
const PORT = 3004;
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Define callback function
const whenIncomingRequest = (req, res) => {
  console.log('request came in');

  read('data.json', (data) => {
    const { index } = req.params;
    if (index > data.recipes.length) {
      res.status(404).send('Sorry, we cannot find that!');
    } else {
      const recipe = data.recipes[index];
      res.send(recipe);
    }
  });
};

const whenYieldRequest = (req, res) => {
  console.log('Yield request came in');
  const { yieldNo } = req.params;
  const recipeList = [];
  read('data.json', (data) => {
    for (let i = 0; i < data.recipes.length; i += 1) {
      if (data.recipes[i].yield && data.recipes[i].yield === Number(yieldNo)) {
        recipeList.push(data.recipes[i]);
      }
    }
    if (recipeList.length === 0) {
      res.send(`No such recipes yield ${yieldNo}`);
    } else {
      let content = `The recipes that yield ${yieldNo} are:`;
      for (let i = 0; i < recipeList.length; i += 1) {
        content += `<br> ${i + 1}: ${recipeList[i].label}`;
      }
      res.send(content);
    }
  });
};

const whenRecipeRequest = (req, res) => {
  console.log('Recipe request came in');
  const { labelName } = req.params;
  const searchResult = [];
  read('data.json', (data) => {
    for (let i = 0; i < data.recipes.length; i += 1) {
      if (data.recipes[i].label.toLowerCase() === labelName.replace(/-/g, ' ')) {
        console.log('recipe found');
        searchResult.push(data.recipes[i]);
      }
    }
    if (searchResult.length === 0) {
      res.send('No such recipe in directory');
    } else {
      let content = '<html><body>';
      for (const property in searchResult[0]) {
        content += `<h3>${property}</h3><p>${searchResult[0][property]}</p>`;
      }
      content += '</body></html>';
      res.send(`${content}`);
    }
  });
};

// Create route/ middleware (base)
app.get('/recipe/:index', whenIncomingRequest);

// Create route/ middle (comfortable)
app.get('/yield/:yieldNo', whenYieldRequest);

// Create route/ middleware (more comfortable)
app.get('/recipe-label/:labelName', whenRecipeRequest);

// Create route/ middleware for categories
app.get('/', (req, res) => {
  console.log('generating category main page');
  const categoryArray = [];
  // read the data
  read('data.json', (data) => {
    for (let i = 0; i < data.recipes.length; i += 1){
      if (data.recipes[i].category && !categoryArray.includes(data.recipes[i].category)){
        categoryArray.push(data.recipes[i].category);
      }
    }
    categoryArray.sort();
    console.log(categoryArray);
    res.render('main', {categoryArray});
  })
})

app.get('/category/:catName', (req, res) => {
  console.log('main page -> category page');
  const {catName} = req.params;
  const categoryObj = {
    name: catName,
    recipes: [],
  }
  read('data.json', (data) => {
    // Add recipes of that category
    for (let i = 0; i < data.recipes.length; i += 1){
      if (data.recipes[i].category && data.recipes[i].category.toLowerCase() === catName){
        categoryObj.recipes.push(data.recipes[i].label);
      }
    }
    // Sort and render page
    categoryObj.recipes.sort();
    res.render("category", {categoryObj});
  })
})

// Start the server
app.listen(PORT);
