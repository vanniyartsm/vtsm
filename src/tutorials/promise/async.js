var User = require('../../model/User');

var users = [{id: 1, data: "admin", left:2, right:3, parentId : -1}, 
                {id: 2, data: "zak100", left:4, parentId : 1},
                {id: 3, data: "vizhi", left:5, right:6, parentId : 1},
                
                {id: 4, data: "pensen", right:7, parentId : 2},
                {id: 5, data: "suresh", parentId : 3},
                {id: 6, data: "menaga", parentId : 3},


                {id: 7, data: "raja", right:8, parentId : 4},
    
                {id: 8, data: "malar", right:9, parentId : 7},
                {id: 9, data: "john", parentId : 8}]

const runAsyncFunctions = async (id, users, counter) => {
  var query = {_id:true,userName:true,firstName:true,lastName:true,emailAddress:true,phoneNumber:true,referralCode:true, sponsorId: true, position:true, parentId : true, status:true, created: true, updated: true, left:true, right: true, leftMost:true, rightMost: true, active:true,status:true, lots:true, bCount: true, sbCount: true, seqId: true};
  const user = await User.findOne({ _id : id }, query);
  //console.info('user = ', user);
  users.push(user);
  //console.info('counter = ', counter);
  counter++;
  if (user) {
    if (user.left) {
      const left = await runAsyncFunctions(user.left, users, counter);
      //console.log('left = ', left, counter)
    }

    if (user.right) {
      const right = await runAsyncFunctions(user.right, users, counter)
      //console.log('right = ', right, counter);
    }
  }

  //return users;
  console.info('final');
  console.info('counter = ', counter);
  //console.log(users);
  if (counter == 1) {
    return users;
  }
}

const runAsyncFunctions1 = async () => {
  const users = await getUsers()

  for (let user of users) {
    const userId = await getIdFromUser(user)
    console.log(userId)

    const capitalizedId = await capitalizeIds(userId)
    console.log(capitalizedId)
  }

  console.log(users)
}

function getUsers () {
    return users;
}

function getIdFromUser (user) {
  return user.id;
}

function capitalizeIds (userId) {
  return true;
}

var users = [];
async function awaiting () {
  var val = await runAsyncFunctions("596c8bf65a12076ff0cc74b1", users, 0);
  console.info('val = ', val);
}

awaiting();