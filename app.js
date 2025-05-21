const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3000;

let tramitesData = [
    { id: 1, responsable: 'Paweł Kuna', tramite: 'UI Designer, Training', email: 'paweluna@howstuffworks.com', permiso: 'User' },
    { id: 2, responsable: 'Jeffie Lewzey', tramite: 'Chemical Engineer, Support', email: 'jlewzey1@seesaa.net', permiso: 'Admin' },
    // Add a few more sample items based on the original tramites.html
];
let nextTramiteId = 3; // To simulate auto-incrementing ID

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Configure express-session
app.use(session({
  secret: 'averyrandomsecretkey123!', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true
}));

// Serve static files from the 'dist' directory
app.use(express.static('dist'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/');
}

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/inicio', isAuthenticated, (req, res) => {
  res.render('inicio', { user: req.session.user });
});

app.get('/automatizaciones', isAuthenticated, (req, res) => {
  res.render('automatizaciones', { user: req.session.user });
});

app.get('/configuracion', isAuthenticated, (req, res) => {
  res.render('configuracion', { user: req.session.user });
});

app.get('/documentos', isAuthenticated, (req, res) => {
  res.render('documentos', { user: req.session.user });
});

app.get('/perfil', isAuthenticated, (req, res) => {
  res.render('perfil', { user: req.session.user });
});

app.get('/tramite', isAuthenticated, (req, res) => {
  // Assuming you'll want to fetch specific tramite details later
  const tramiteId = req.query.id;
  const tramiteDetail = tramitesData.find(t => t.id == tramiteId);
  res.render('tramite', { user: req.session.user, tramite: tramiteDetail });
});

app.get('/tramites', isAuthenticated, (req, res) => {
  res.render('tramites', { tramites: tramitesData, user: req.session.user });
});

app.get('/usuarios', isAuthenticated, (req, res) => {
  res.render('usuarios', { user: req.session.user });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@example.com' && password === 'password') {
    req.session.user = { email: 'admin@example.com', name: 'Admin User' };
    res.redirect('/inicio');
  } else {
    res.redirect('/');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/'); // Or handle error appropriately
    }
    res.redirect('/');
  });
});

app.post('/tramites/nuevo', isAuthenticated, (req, res) => {
    const { nombre, tipoTramite, urlPath, visibilidad, nombreUsuario, fechaInicio, informacionAdicional } = req.body;
    const newTramite = {
        id: nextTramiteId++,
        responsable: nombreUsuario || req.session.user.name, // Use provided name or session user's name
        tramite: nombre, // Assuming 'nombre' from modal is the main description
        email: req.session.user.email, // Or a different email if provided
        permiso: 'User', // Default or based on some logic
        // Add other fields from req.body as needed
        // For now, let's add all available fields for clarity, even if not displayed in the main table
        tipoTramite: tipoTramite,
        urlPath: urlPath,
        visibilidad: visibilidad,
        fechaInicio: fechaInicio,
        informacionAdicional: informacionAdicional
    };
    tramitesData.push(newTramite);
    console.log('New trámite added:', newTramite);
    console.log('Form data received:', req.body);
    res.redirect('/tramites');
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Generic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! Please try again later.');
    // Optionally, you could render a 500.ejs page here:
    // res.status(500).render('500', { title: 'Server Error', error: err });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
