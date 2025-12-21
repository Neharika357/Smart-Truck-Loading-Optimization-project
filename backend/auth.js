const router = require('express').Router();
const User = require('./models/User');
const TruckDealer = require('./models/TruckDealer'); 
const WarehouseUser = require('./models/WarehouseUser');


router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      companyName,
      managerName,
      location,
      contactNumber,
      serviceArea,
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const userData = {
      fullName,
      email,
      password, 
      role,
      companyName,
    };

    if (role === 'warehouse') {
      if (!managerName || !location) {
        return res.status(400).json({ message: 'Missing warehouse details' });
      }

      const warehouseEntry = new WarehouseUser({
            username: fullName,
            email: email
        });
      await warehouseEntry.save();
      
      userData.managerName = managerName;
      userData.location = location;
    }

    if (role === 'dealer') {
      if (!contactNumber || !serviceArea) {
        return res.status(400).json({ message: 'Missing dealer details' });
      }

      const dealerEntry = new TruckDealer({
            username: fullName, 
            email: email
        });
       await dealerEntry.save();

      userData.contactNumber = contactNumber;
      userData.serviceAreas = [serviceArea];
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      token: 'fake-jwt-token-' + savedUser._id,
      role: savedUser.role,
      user: {
        id: savedUser._id,
        email: savedUser.email,
      },
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    res.status(200).json({
      message: 'Login successful',
      token: 'fake-jwt-token-' + user._id,
      role: user.role,
      user: {
        id: user._id,
        fullName: user.fullName,
      },
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

module.exports = router;
