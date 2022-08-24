const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');


const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const exflash = require('express-flash');
// const Auth_mdw = require('./middleware/auth');
const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

JWT_SECRET='dgdgdgdgkkkl'
CLIENT_URL='http://localhost:4000'

require('./utils/db');
const User = require('./model/user');




const app = express();
const port = 4000;

// setup method override
app.use(methodOverride('_method'));

// setup ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 


// body-parser
app.use(bodyParser.json());

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: { maxAge: 1000000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
})
);
app.use(flash());





let sess;

function checkUserSession(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    req.flash('msg', 'Anda harus login terlebih dahulu!');
    res.redirect('/login');
  }
}
  
// route for Home-Page admin
app.get("/",  (req, res) => {
    res.redirect("/login");
    });




//halaman register
app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'layouts/main-layout',
         title: 'Halaman register',
         msg: req.flash('msg'),
        });
});



// proses tambah registrasi user
app.post('/register/add', async (req,res) => {
    const { username, email, nama_lengkap, password} = req.body

    const emailUser = await User.findOne({email: email})
    const usernameuser = await User.findOne({username: username})
    const nama_lengkapuser = await User.findOne({nama_lengkap: nama_lengkap})

    
   if(usernameuser) {
    return res.status(404).json({
        status: false,
        message: 'username sudah tersedia'
    })
}

   if(emailUser) {
       return res.status(404).json({
           status: false,
           message: 'email sudah tersedia'
       })
   }
   
    const hashPassword = await bcryptjs.hash(password, 10)
    const user = new User({
        username: username,
        email: email,
        nama_lengkap: nama_lengkap,
        password: hashPassword,
    })
    
    user.save()
    req.flash('msg', 'Data user berhasil ditambahkan!');
    res.render('add-register', {
        layout: 'layouts/main-layout',
         title: 'Halaman register',
         msg: req.flash('msg'),
    });
});
 

app.get('/register/add', async (req, res) => {

        res.render('add-register', {
            layout: 'layouts/main-layout',
            title: 'Halaman register',
            users,
            msg: req.flash('msg'),
        });
    });


app.get('/login', (req, res) => {
    sess = req.session;
    res.render('login', {
        layout: 'layouts/main-layout',
        title: 'Halaman Login Admin',
        msg: req.flash('msg'),
      belumLogin: req.flash('msg'),
      logout: req.flash('logout')
    });
  });




  // PROSES LOGIN 
app.post('/login', async (req, res) => {
//   await userLogin(req.body, "user", res);
    sess = req.session;
    const { username, password, level, } = req.body
    const datauser = await User.findOne({$or: [{username: username}, {email: username}, {username: level}]})
    if(datauser) {
        // jika username nya ada masuk proses ini
        const passwordUser = await bcryptjs.compare(password, datauser.password)
        if(passwordUser) {
            //jika passnya ada masuk ke proses ini
            const data = {
                id: datauser._id
            }
            const token = await jsonwebtoken.sign(data,JWT_SECRET)
            sess.username = username;
            sess.password = password;
            sess.level = level;
            sess.loggedin = true;
            
            res.render('dashboard', {
                msg: req.flash("msg"),
                layout: 'layouts/main-layout',
                title: 'Halaman Dashboard',
                message: 'berhasil',
                token: token
            })
   
    }
    else{
        req.flash('msg','Akses ditolak! anda tidak dapat mengakses halaman ini!');
        res.render('login', {
          msg: req.flash('msg'),
          layout: 'layouts/main-layout',
          title: 'Halaman Login Admin',
        });
      }

    } else {
      req.flash('msg', 'Username atau password tidak tersedia!');
      res.render('login', {
        msg: req.flash('msg'),
        layout: 'layouts/main-layout',
        title: 'Halaman Login Admin', 
      });
    }  
});

  


// halaman dashboard
app.get('/dashboard', checkUserSession, async (req, res) => {
    sess = req.session;
    sess.loggedin = true;
    req.flash("msg", "Anda telah login!");
    res.render('dashboard', {
        title: 'Halaman Dashboard',
        msg: req.flash('msg'),
        layout: 'layouts/main-layout',
        loggedin: sess.loggedin
    });
});




// halaman user
app.get('/user', checkUserSession,  async (req, res) => {

    const users = await User.find();
    
    res.render('user', {
        layout: 'layouts/main-layout',
        title: 'Halaman User',
        msg: req.flash('msg'),
        users,
        
    });
});

// halaman tambah user
app.get('/tambah-user', checkUserSession, (req, res) => {
    sess = req.session;
    sess.loggedin = true;
    res.render('add-user', {
    title: 'Halaman tambah user',
    layout: 'layouts/main-layout',
});
});

// halaman form tambah data user
app.get('/user/add',  checkUserSession, (req, res) => {
res.render('add-user', {
    title: 'Form Tambah Data user',
    layout: 'layouts/main-layout',
});
});

// proses tambah data user
app.post('/user', async (req,res) => {
    const { username, email, nama_lengkap, level, password} = req.body

    const emailUser = await User.findOne({email: email})
    const usernameuser = await User.findOne({username: username})
    const nama_lengkapuser = await User.findOne({nama_lengkap: nama_lengkap})
    const leveluser = await User.findOne({level: level})

    
   if(usernameuser) {
    return res.status(404).json({
        status: false,
        message: 'username sudah tersedia'
    })
}

   if(emailUser) {
       return res.status(404).json({
           status: false,
           message: 'email sudah tersedia'
       })
   }
   
    const hashPassword = await bcryptjs.hash(password, 10)
    const user = new User({
        username: username,
        email: email,
        nama_lengkap: nama_lengkap,
        level: level,
        password: hashPassword,
    })
    
    user.save()
        // kirimkan flash message
        req.flash('msg', 'Data user berhasil ditambahkan!');
        res.redirect('/user');
});
 

// halaman form ubah data user
app.get('/user/edit/:username', checkUserSession, async (req, res) => {
    const user = await User.findOne({ username: req.params.username });

    res.render('edit-user', {
        title: 'Form Ubah Data user',
        layout: 'layouts/main-layout',
        user,
        
    });
});

// proses ubah data user
app.put('/user', 
[
    body('username').custom(async (value, { req }) => {
        const duplikat = await User.findOne({ username: value});
        if(value !== req.body.oldUsername && duplikat) {
            throw new Error('Nama user sudah ada');
        }
        return true;
    }),
    check ('email', 'Email tidak valid!').isEmail(),
    check('nama_lengkap', ''),
    check('level', ''),
    check('password', 'Password tidak valid')
 ], 
 (req, res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
    res.render('edit-user', {
        title: 'Form Ubah Data User',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        user: req.body,
    });
    } else {
    User.updateOne(
    { _id: req.body._id },
    {
        $set: {
            username: req.body.username,
            email: req.body.email,
            nama_lengkap: req.body.nama_lengkap,
            level: req.body.level,
            password: req.body.password,
        },
    }
    ).then((result) => {
    // kirimkan flash message
       req.flash('msg', 'Data user berhasil diubah!');
       res.redirect('/user');

    });
    }

});

// form delete user
app.delete('/user', (req, res) => {
    User.deleteOne({ username: req.body.username }).then((result) => {
    req.flash('msg', 'Data user berhasil dihapus!');
    res.redirect('/user');
  });
});

// halaman logout admin
app.get('/logout', (req, res) => {
    res.redirect("/?logout=true");
    req.session.destroy((err) => {
        if (err) {
          return console.log(err);
        }
        
    });
});




app.use("/login", (req, res) => {
    res.status(404);
    res.render('404');
  });




  

app.listen(port, () => {
    console.log(`TEST BTS.id | listening aat http://localhost:${port}`);
});