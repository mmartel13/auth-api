const { connectDb } = require("./dbConnect");

exports.createUser = (req, res) => {
  //first lets do some validation...(email, password)
  if (!req.body || !req.body.email || !req.body.password) {
    //invalid request
    res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
    return; //exiting the create user function don't run code below
  }
  const newUser = {
    email: req.body.email.toLowerCase(), //do to lower case so recognizes email whether they type it in lower or upper case 
    password: req.body.password,
    isAdmin: false,
    userRole: 5,
  };

  const db = connectDb();
  db.collection("users")
    .add(newUser)
    .then((doc) => {
      const user= { //this will become the payload for our JWT
        id: doc.id,
        email: newUser.email,
        isAdmin: false,
        userRole: 5
      }
      //TO DO:create a JWT and send back the token
      res.status(201).send({ 
        success: true,
        message: 'Account created', 
        token: "token goes here", //add this to token later 

      });
    })
    .catch((err) => res.status(500).send({
      success: false,
      message: err.message,
      error: err
     }));
};

exports.loginUser = (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
    return; 
  }
  const db = connectDb()
  db.collection('users')
  .where('email', "==", req.body.email.toLowerCase()) //put == in string here so JS isn't trying to check for equality 
  .where('password', '==', req.body.password)
  .get()
  .then(snapshot => { //on a collection always gets us a snapshot (bc not a single doc)
    if(snapshot.empty) { //bad login
      res.status(401).send({
        success: false,
        message: 'Invalid email or password'
      })
      return
    }
    //good login
    const users = snapshot.docs.map(doc => {
     let user = doc.data()
       user.id = doc.id
       user.password = undefined
       return user 
    })
    res.send({
      success: true,
      message: 'Login successful',
      token: users[0] //should only have one user with the specific username/password so just pulling that user out of the array
    })
  }) 
  .catch(err => res.status(500).send({
    success: false,
    message: err.message,
    error: err
  }))
}

exports.getUsers = (req, res) => { //TODO: protect this route with JWT
  const db = connectDb()
  db.collection('users').get()
  .then(snapshot => {
    const users = snapshot.docs.map(doc => {
      let user = doc.data()
      user.id = doc.id
      user.password = undefined
      return user
    })
    res.send({
      success: true,
      message: 'Users returned',
      users
    })
  })
  .catch(err => res.status(500).send({
    success: false,
    message: err.message,
    error: err
  }))
}