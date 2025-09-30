const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const adminRouter = express.Router();
app.use('/admin', adminRouter);

// Backoffice Routes
adminRouter.get('/', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

// Header management routes
adminRouter.get('/header', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'header.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading header data');
        }
        res.render('header', { title: 'Manage Header', header: JSON.parse(data) });
    });
});

adminRouter.post('/header', (req, res) => {
    const newHeader = {
        contact: req.body.contact,
        email: req.body.email
    };
    fs.writeFile(path.join(__dirname, 'data', 'header.json'), JSON.stringify(newHeader, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error writing header data');
        }
        res.redirect('/admin/header');
    });
});

// Multer setup for image uploads
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: imageStorage });

// Multer setup for form uploads
const formStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/forms/'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const uploadForm = multer({ storage: formStorage });

// Menu management routes
adminRouter.get('/menu', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading menu data');
        }
        res.render('menu', { title: 'Manage Menu', menu: JSON.parse(data) });
    });
});

adminRouter.post('/menu', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading menu data');
        }
        const menu = JSON.parse(data);
        menu.push({ text: req.body.text, url: req.body.url });
        fs.writeFile(path.join(__dirname, 'data', 'menu.json'), JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing menu data');
            }
            res.redirect('/admin/menu');
        });
    });
});

adminRouter.post('/menu/update', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading menu data');
        }
        const menu = JSON.parse(data);
        const index = req.body.index;
        if (menu[index]) {
            menu[index] = { text: req.body.text, url: req.body.url };
        }
        fs.writeFile(path.join(__dirname, 'data', 'menu.json'), JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing menu data');
            }
            res.redirect('/admin/menu');
        });
    });
});

adminRouter.post('/menu/delete', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'menu.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading menu data');
        }
        const menu = JSON.parse(data);
        const index = req.body.index;
        if (menu[index]) {
            menu.splice(index, 1);
        }
        fs.writeFile(path.join(__dirname, 'data', 'menu.json'), JSON.stringify(menu, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing menu data');
            }
            res.redirect('/admin/menu');
        });
    });
});

// Slider management routes
adminRouter.get('/slider', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'slider.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading slider data');
        }
        res.render('slider', { title: 'Manage Slider', slider: JSON.parse(data) });
    });
});

adminRouter.post('/slider', upload.single('image'), (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'slider.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading slider data');
        }
        const slider = JSON.parse(data);
        const newSlide = {
            image: req.file ? `uploads/${req.file.filename}` : '',
            caption: {
                title: req.body.title,
                text: req.body.text
            }
        };
        slider.push(newSlide);
        fs.writeFile(path.join(__dirname, 'data', 'slider.json'), JSON.stringify(slider, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing slider data');
            }
            res.redirect('/admin/slider');
        });
    });
});

adminRouter.post('/slider/update', upload.single('image'), (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'slider.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading slider data');
        }
        const slider = JSON.parse(data);
        const index = req.body.index;
        if (slider[index]) {
            slider[index].caption.title = req.body.title;
            slider[index].caption.text = req.body.text;
            if (req.file) {
                const oldImagePath = path.join(__dirname, 'public', slider[index].image);
                if (fs.existsSync(oldImagePath) && !slider[index].image.startsWith('http')) {
                    fs.unlinkSync(oldImagePath);
                }
                slider[index].image = `uploads/${req.file.filename}`;
            }
        }
        fs.writeFile(path.join(__dirname, 'data', 'slider.json'), JSON.stringify(slider, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing slider data');
            }
            res.redirect('/admin/slider');
        });
    });
});

adminRouter.post('/slider/delete', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'slider.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading slider data');
        }
        const slider = JSON.parse(data);
        const index = req.body.index;
        if (slider[index]) {
            const imagePath = path.join(__dirname, 'public', slider[index].image);
            if (fs.existsSync(imagePath) && !slider[index].image.startsWith('http')) {
                fs.unlinkSync(imagePath);
            }
            slider.splice(index, 1);
        }
        fs.writeFile(path.join(__dirname, 'data', 'slider.json'), JSON.stringify(slider, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing slider data');
            }
            res.redirect('/admin/slider');
        });
    });
});

// Card management routes
adminRouter.get('/cards', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading cards data');
        }
        res.render('cards', { title: 'Manage Cards', cards: JSON.parse(data) });
    });
});

adminRouter.post('/cards/:section', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), (req, res) => {
    const { section } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading cards data');
        }
        const cards = JSON.parse(data);
        const newCard = {
            image: req.files['image'] ? `uploads/${req.files['image'][0].filename}` : '',
            bannerImage: req.files['bannerImage'] ? `uploads/${req.files['bannerImage'][0].filename}` : '',
            title: req.body.title,
            description: req.body.description,
            buttonText: req.body.buttonText,
            buttonLink: req.body.buttonLink
        };
        cards[section].items.push(newCard);
        fs.writeFile(path.join(__dirname, 'data', 'cards.json'), JSON.stringify(cards, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing cards data');
            }
            res.redirect('/admin/cards');
        });
    });
});

adminRouter.post('/cards/:section/update', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), (req, res) => {
    const { section } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading cards data');
        }
        const cards = JSON.parse(data);
        const index = req.body.index;
        if (cards[section] && cards[section].items[index]) {
            const item = cards[section].items[index];
            item.title = req.body.title;
            item.description = req.body.description;
            item.buttonText = req.body.buttonText;
            item.buttonLink = req.body.buttonLink;

            if (req.files['image']) {
                const oldImagePath = path.join(__dirname, 'public', item.image);
                if (item.image && fs.existsSync(oldImagePath) && !item.image.startsWith('http')) {
                    fs.unlinkSync(oldImagePath);
                }
                item.image = `uploads/${req.files['image'][0].filename}`;
            }

            if (req.files['bannerImage']) {
                const oldBannerPath = path.join(__dirname, 'public', item.bannerImage);
                if (item.bannerImage && fs.existsSync(oldBannerPath) && !item.bannerImage.startsWith('http')) {
                    fs.unlinkSync(oldBannerPath);
                }
                item.bannerImage = `uploads/${req.files['bannerImage'][0].filename}`;
            }
        }
        fs.writeFile(path.join(__dirname, 'data', 'cards.json'), JSON.stringify(cards, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing cards data');
            }
            res.redirect('/admin/cards');
        });
    });
});

adminRouter.post('/cards/:section/delete', (req, res) => {
    const { section } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading cards data');
        }
        const cards = JSON.parse(data);
        const index = req.body.index;
        if (cards[section] && cards[section].items[index]) {
            const item = cards[section].items[index];

            const imagePath = path.join(__dirname, 'public', item.image);
            if (item.image && fs.existsSync(imagePath) && !item.image.startsWith('http')) {
                fs.unlinkSync(imagePath);
            }

            const bannerPath = path.join(__dirname, 'public', item.bannerImage);
            if (item.bannerImage && fs.existsSync(bannerPath) && !item.bannerImage.startsWith('http')) {
                fs.unlinkSync(bannerPath);
            }

            cards[section].items.splice(index, 1);
        }
        fs.writeFile(path.join(__dirname, 'data', 'cards.json'), JSON.stringify(cards, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing cards data');
            }
            res.redirect('/admin/cards');
        });
    });
});

// Events management routes
adminRouter.get('/events', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading events data');
        }
        res.render('events', { title: 'Manage Events', events: JSON.parse(data) });
    });
});

adminRouter.post('/events/category', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading events data');
        }
        const events = JSON.parse(data);
        const categoryKey = req.body.categoryName.toLowerCase().replace(/\s+/g, '-');
        if (!events[categoryKey]) {
            events[categoryKey] = {
                name: req.body.categoryName,
                items: []
            };
        }
        fs.writeFile(path.join(__dirname, 'data', 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing events data');
            }
            res.redirect('/admin/events');
        });
    });
});

adminRouter.post('/events/:category', (req, res) => {
    const { category } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading events data');
        }
        const events = JSON.parse(data);
        if (events[category]) {
            events[category].items.push({
                title: req.body.title,
                date: req.body.date,
                description: req.body.description
            });
        }
        fs.writeFile(path.join(__dirname, 'data', 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing events data');
            }
            res.redirect('/admin/events');
        });
    });
});

adminRouter.post('/events/:category/update', (req, res) => {
    const { category } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading events data');
        }
        const events = JSON.parse(data);
        const index = req.body.index;
        if (events[category] && events[category].items[index]) {
            events[category].items[index] = {
                title: req.body.title,
                date: req.body.date,
                description: req.body.description
            };
        }
        fs.writeFile(path.join(__dirname, 'data', 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing events data');
            }
            res.redirect('/admin/events');
        });
    });
});

adminRouter.post('/events/:category/delete', (req, res) => {
    const { category } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading events data');
        }
        const events = JSON.parse(data);
        const index = req.body.index;
        if (events[category] && events[category].items[index]) {
            events[category].items.splice(index, 1);
        }
        fs.writeFile(path.join(__dirname, 'data', 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing events data');
            }
            res.redirect('/admin/events');
        });
    });
});

adminRouter.post('/events/:category/delete_category', (req, res) => {
    const { category } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'events.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading events data');
        }
        const events = JSON.parse(data);
        if (events[category]) {
            delete events[category];
        }
        fs.writeFile(path.join(__dirname, 'data', 'events.json'), JSON.stringify(events, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing events data');
            }
            res.redirect('/admin/events');
        });
    });
});

// CMS Page Management Routes
adminRouter.get('/pages', (req, res) => {
    fs.readdir(path.join(__dirname, 'data/pages'), (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading pages directory');
        }
        const pageNames = files.map(file => file.replace('.json', ''));
        res.render('pages', { title: 'Manage Pages', pages: pageNames });
    });
});

adminRouter.get('/pages/edit/home', (req, res) => {
    res.render('edit-home');
});

adminRouter.get('/pages/edit/:pageName', (req, res) => {
    const { pageName } = req.params;
    fs.readFile(path.join(__dirname, `data/pages/${pageName}.json`), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading page data');
        }
        res.render('edit-page', { title: `Edit ${pageName}`, pageName, pageData: JSON.parse(data) });
    });
});

adminRouter.post('/pages/edit/:pageName', (req, res) => {
    const { pageName } = req.params;
    fs.readFile(path.join(__dirname, `data/pages/${pageName}.json`), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading page data');
        }
        const pageData = JSON.parse(data);
        // Recursively update pageData with values from req.body
        const updateData = (obj, body) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    updateData(obj[key], body);
                } else {
                    if (body[key]) {
                        obj[key] = body[key];
                    }
                }
            }
        };
        updateData(pageData, req.body);

        fs.writeFile(path.join(__dirname, `data/pages/${pageName}.json`), JSON.stringify(pageData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing page data');
            }
            res.redirect(`/admin/pages/edit/${pageName}`);
        });
    });
});

// Footer Management Routes
adminRouter.get('/footer', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/footer.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading footer data');
        }
        res.render('footer', { title: 'Manage Footer', footer: JSON.parse(data) });
    });
});

adminRouter.post('/footer/update', (req, res) => {
    fs.readFile(path.join(__dirname, 'data/footer.json'), 'utf8', (err, data) => {
        if (err) { console.error(err); return res.status(500).send('Error reading footer data'); }
        const footer = JSON.parse(data);

        // Update simple text fields
        footer.about.text = req.body.about_text;
        footer.bottom.text = req.body.bottom_text;

        // Update links
        footer.links.items = [];
        if (req.body.link_text) {
            const linkTexts = Array.isArray(req.body.link_text) ? req.body.link_text : [req.body.link_text];
            const linkUrls = Array.isArray(req.body.link_url) ? req.body.link_url : [req.body.link_url];
            for (let i = 0; i < linkTexts.length; i++) {
                footer.links.items.push({ text: linkTexts[i], url: linkUrls[i] });
            }
        }

        // Update social media links
        footer.social.items = [];
        if (req.body.social_name) {
            const socialNames = Array.isArray(req.body.social_name) ? req.body.social_name : [req.body.social_name];
            const socialUrls = Array.isArray(req.body.social_url) ? req.body.social_url : [req.body.social_url];
            const socialIcons = Array.isArray(req.body.social_icon) ? req.body.social_icon : [req.body.social_icon];
            for (let i = 0; i < socialNames.length; i++) {
                footer.social.items.push({ name: socialNames[i], url: socialUrls[i], icon: socialIcons[i] });
            }
        }

        fs.writeFile(path.join(__dirname, 'data/footer.json'), JSON.stringify(footer, null, 2), (err) => {
            if (err) { console.error(err); return res.status(500).send('Error writing footer data'); }
            res.redirect('/admin/footer');
        });
    });
});

// Document Management for Services Page
adminRouter.post('/services/forms/add', uploadForm.single('form'), (req, res) => {
    fs.readFile(path.join(__dirname, 'data/pages/services.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading services data');
        }
        const services = JSON.parse(data);
        const newForm = {
            name: req.body.name,
            file: `forms/${req.file.filename}`
        };
        services.forms.items.push(newForm);
        fs.writeFile(path.join(__dirname, 'data/pages/services.json'), JSON.stringify(services, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing services data');
            }
            res.redirect('/admin/pages/edit/services');
        });
    });
});

adminRouter.post('/services/forms/delete', (req, res) => {
    const index = req.body.index;
    fs.readFile(path.join(__dirname, 'data/pages/services.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading services data');
        }
        const services = JSON.parse(data);
        if (services.forms.items[index]) {
            const form = services.forms.items[index];
            const filePath = path.join(__dirname, 'public', form.file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            services.forms.items.splice(index, 1);
        }
        fs.writeFile(path.join(__dirname, 'data/pages/services.json'), JSON.stringify(services, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing services data');
            }
            res.redirect('/admin/pages/edit/services');
        });
    });
});

// Front-end routes
const renderPage = (res, viewName, pageName) => {
    const data = {};
    const filesToRead = {
        header: 'header.json',
        menu: 'menu.json',
        footer: 'footer.json',
        page: `pages/${pageName}.json`
    };

    // For the homepage, we also need slider and cards data
    if (pageName === 'index') {
        filesToRead.slider = 'slider.json';
        filesToRead.cards = 'cards.json';
        delete filesToRead.page; // No specific page.json for index
    }

    const filePromises = Object.entries(filesToRead).map(([key, file]) => {
        return fs.promises.readFile(path.join(__dirname, 'data', file), 'utf8')
            .then(content => {
                data[key] = JSON.parse(content);
            });
    });

    Promise.all(filePromises)
        .then(() => {
            res.render(`site/${viewName}`, data);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error loading page data');
        });
};

app.get('/', (req, res) => {
    renderPage(res, 'index', 'index');
});

app.get('/index', (req, res) => {
    res.redirect('/');
});

app.get('/:page', (req, res) => {
    const { page } = req.params;
    const pagePath = path.join(__dirname, 'views/site', `${page}.ejs`);

    fs.access(pagePath, fs.constants.F_OK, (err) => {
        if (!err) {
            renderPage(res, page, page);
        } else {
            res.redirect('/');
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Backoffice is running on http://localhost:${PORT}/admin`);
});