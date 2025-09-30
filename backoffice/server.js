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

adminRouter.post('/cards/:section', upload.single('image'), (req, res) => {
    const { section } = req.params;
    fs.readFile(path.join(__dirname, 'data', 'cards.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading cards data');
        }
        const cards = JSON.parse(data);
        const newCard = {
            image: req.file ? `uploads/${req.file.filename}` : '',
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

adminRouter.post('/cards/:section/update', upload.single('image'), (req, res) => {
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
            if (req.file) {
                const oldImagePath = path.join(__dirname, 'public', item.image);
                if (fs.existsSync(oldImagePath) && !item.image.startsWith('http')) {
                    fs.unlinkSync(oldImagePath);
                }
                item.image = `uploads/${req.file.filename}`;
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
            if (fs.existsSync(imagePath) && !item.image.startsWith('http')) {
                fs.unlinkSync(imagePath);
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

adminRouter.post('/pages/create', (req, res) => {
    const { pageName } = req.body;
    if (!pageName || !/^[a-z0-9-]+$/.test(pageName)) {
        return res.status(400).send('Invalid page name.');
    }

    const dataFilePath = path.join(__dirname, `data/pages/${pageName}.json`);
    const viewFilePath = path.join(__dirname, `views/site/${pageName}.ejs`);

    if (fs.existsSync(dataFilePath) || fs.existsSync(viewFilePath)) {
        return res.status(400).send('Page already exists.');
    }

    const defaultPageData = {
        title: pageName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        header: 'Welcome to the new page!',
        content: 'This is your new page. You can edit this content in the backoffice.'
    };

    const defaultEjsContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= page.title %></title>
    <link rel="icon" href="/public/images/LogoZan.png" type="image/png">
    <link rel="stylesheet" href="/public/css/site.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
</head>
<body>
    <%- include('../partials/header', { header: header, menu: menu }) %>
    <main>
        <div class="container">
            <section class="page-header">
                <h1><%= page.header %></h1>
            </section>
            <section>
                <p><%= page.content %></p>
            </section>
        </div>
    </main>
    <%- include('../partials/footer', { footer: footer }) %>
    <script src="/public/js/site.js"></script>
</body>
</html>
    `;

    fs.writeFile(dataFilePath, JSON.stringify(defaultPageData, null, 2), (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating page data file.');
        }
        fs.writeFile(viewFilePath, defaultEjsContent.trim(), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error creating page view file.');
            }
            res.redirect(`/admin/pages/edit/${pageName}`);
        });
    });
});

adminRouter.post('/pages/edit/:pageName', upload.any(), (req, res) => {
    const { pageName } = req.params;
    const filePath = path.join(__dirname, `data/pages/${pageName}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading page data');
        }

        let pageData = JSON.parse(data);
        const body = req.body;
        const files = req.files || [];

        // Create a map of uploaded files for easy access
        const fileMap = {};
        files.forEach(file => {
            fileMap[file.fieldname] = `uploads/${file.filename}`;
        });

        // Specific handler for the index page
        if (pageName === 'index') {
            pageData.title = body.title;

            // Update slider
            pageData.slider.forEach((slide, index) => {
                if (body.slider && body.slider[index]) {
                    slide.caption.title = body.slider[index].caption.title;
                    slide.caption.text = body.slider[index].caption.text;
                }
                const newImage = fileMap[`slider-image-${index}`];
                if (newImage) {
                    slide.image = newImage;
                }
            });

            // Update cards
            Object.keys(pageData.cards).forEach(sectionKey => {
                const section = pageData.cards[sectionKey];
                if (body.cards && body.cards[sectionKey]) {
                    section.title = body.cards[sectionKey].title;
                    section.link = body.cards[sectionKey].link;
                }
                section.items.forEach((card, cardIndex) => {
                    if (body.cards && body.cards[sectionKey] && body.cards[sectionKey].items && body.cards[sectionKey].items[cardIndex]) {
                        const cardBody = body.cards[sectionKey].items[cardIndex];
                        card.title = cardBody.title;
                        card.description = cardBody.description;
                        card.buttonText = cardBody.buttonText;
                        card.buttonLink = cardBody.buttonLink;
                    }
                    const newCardImage = fileMap[`card-image-${sectionKey}-${cardIndex}`];
                    if (newCardImage) {
                        card.image = newCardImage;
                    }
                    const newBannerImage = fileMap[`card-bannerImage-${sectionKey}-${cardIndex}`];
                    if (newBannerImage) {
                        card.bannerImage = newBannerImage;
                    }
                });
            });
        } else {
            // Generic handler for other pages
            const updateObject = (obj, data, parentKey = '') => {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const formKey = parentKey ? `${parentKey}[${key}]` : key;
                        if (Array.isArray(obj[key])) {
                            obj[key].forEach((item, index) => {
                                updateObject(item, data, `${formKey}[${index}]`);
                            });
                        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                            updateObject(obj[key], data, formKey);
                        } else {
                            if (data[formKey] !== undefined) {
                                obj[key] = data[formKey];
                            }
                            const fileKey = `${formKey}_file`;
                            if (fileMap[fileKey]) {
                                obj[key] = fileMap[fileKey];
                            }
                        }
                    }
                }
            };
            updateObject(pageData, body);
        }

        fs.writeFile(filePath, JSON.stringify(pageData, null, 2), (err) => {
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
const renderPage = async (res, viewName, pageName) => {
    try {
        const data = {};

        // Base files for every page
        const filesToRead = {
            header: 'header.json',
            menu: 'menu.json',
            footer: 'footer.json',
            page: `pages/${pageName}.json`
        };

        // Read all base files
        const promises = Object.entries(filesToRead).map(async ([key, file]) => {
            const content = await fs.promises.readFile(path.join(__dirname, 'data', file), 'utf8');
            data[key] = JSON.parse(content);
        });
        await Promise.all(promises);

        // Check for and read data dependencies from the loaded page data
        if (data.page && data.page.dataDependencies) {
            const dependencyPromises = Object.entries(data.page.dataDependencies).map(async ([key, file]) => {
                const content = await fs.promises.readFile(path.join(__dirname, 'data', file), 'utf8');
                data[key] = JSON.parse(content);
            });
            await Promise.all(dependencyPromises);
        }

        // Pass slider and cards data from the page object to the root for index page
        if (viewName === 'index') {
            if (data.page.slider) data.slider = data.page.slider;
            if (data.page.cards) data.cards = data.page.cards;
        }

        res.render(`site/${viewName}`, data);
    } catch (err) {
        console.error(`Error rendering page ${pageName}:`, err);
        // Redirect to homepage if a page's json file doesn't exist
        if (err.path && err.path.includes(`pages/${pageName}.json`)) {
            return res.redirect('/');
        }
        res.status(500).send('Error loading page data');
    }
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