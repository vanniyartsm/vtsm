const fruitBasket = {
    apple: 27, 
    grape: 0,
    pear: 14 
  }
  
  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  const getNumFruit = fruit => {
    return sleep(1000).then(v => fruitBasket[fruit])
  }
  
  const control = async _ => {
    console.log('Start')
  
    const numApples = await getNumFruit('apple')
    console.log('Fruit 1 =', numApples)
    
    const numGrapes = await getNumFruit('grape')
    console.log('Fruit 2 =', numGrapes)
  
    const numPears = await getNumFruit('pear')
    console.log('Fruit 3 =', numPears)
  
    console.log('End')
  }

  //control();

  const fruitsToGet = ['apple', 'grape', 'pear']

  const forLoop = async (param1, param2) => {
    console.log('Start param1 = ', param1);
    console.log('Start param2 = ', param2);
  
    for (let index = 0; index < fruitsToGet.length; index++) {
      // Get num of each fruit
      const fruitNum = await getNumFruit(fruitsToGet[index]);
      console.info('Fruit Num = ', fruitNum);
    }
  
    console.log('End')
  }

  //forLoop('hello', 'hi');

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

asyncForEach([1, 2, 3], async (num) => {
  await sleep(50);
  console.log(num);
})
console.log('Done');