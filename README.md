# The Multi-User Drawer management
This management system alows users to register and login to manage their drawer space. With this system, anyone can track their drawer contents and keep an organized space troughout. Each drawer can:
- Have items added to it (no duplicates)
- Increase/Decrease Item quantity (if item reaches quantity 0 - it is removed from the drawer)
- Remove items completely from the drawer
- Create a "TO GET" list in order to mark down items the user wants to get for the drawer
- Compare the "TO GET" list with current drawer items and display what is owned already
 

# Deployment
## Prerequisites:
- node  (version >= 18.1.0)
- Ubuntu WSL

### Instalation
To install all relevant packages please run:
```bash
npm instal
```

To start the aplication run docker:
```bash
docker-compose up --build -d
```

Now we will be working wit Postman and testing our system.

### 1: Setting up Postman
Note: Postmal Collection exported as 2.0

The postman files to import are located:
```bash
cd postman
```

Import the file located in that directory into Postman. You will now have your working environment all set up. 

Note: docker must be deployed in the previous step.
Your view should resemble this:



![Postman view example](/postman/example.png?raw=true) <br />



### 2: Setting up the Drawer management

In order to user the system you have to register. Please use the Register call and input the username and password:

```bash
{
  "username": "newuser",
  "password": "password123"
}
```

Note: Body -> Raw -> JSON

After your registration, you will receive a JWT token that will be valid for 1h. Copy the generated token and paste it into the "My Desk Drawer" Authorization tab (Bearer Token).
This should allow you to use all other functions in the Drawer catalogue.

If your session expires - just login with the same credentials and a new JWT token will be generated. Paste the new one into the Authorization tab and you are good to go.


### 3: The Drawer management

Now you are free to play around and interact with your drawers an add items to them. The description below will focus on describing each call.

#### GET all user drawer items

Simply gets all drawer items you have input into your drawer.

#### GET drawer items by ID

Will return input drawer item by its ID.
To input ID please refer to the ID field in the Path Variables.
ID should look like this:

```bash
66ba4304b0121af47a632d0a
```

#### GET compare TO GET list with drawer items

Will return "TO GET" list items and mark if you have them in your drawer.
To input ID please refer to the ID field in the Path Variables.
ID should look like this:

```bash
66ba4304b0121af47a632d0a
```

#### PUT update existing items

Edits exisitng item name, quantity and description.

```bash
{
    "name": "napkin",
    "quantity": 1,
    "description": "A simple napkin"
}
```

To input ID please refer to the ID field in the Path Variables.
ID should look like this:

```bash
66ba4304b0121af47a632d0a
```

#### POST add item to TO GET list

Can add a list of items to the "TO GET" list. Does not allow duplicates.

```bash
{
    "items": ["paste", "pen"]
}
```

#### POST add item to drawer

Adds items to your drawer.

```bash
{
    "name": "napkin",
    "quantity": 1,
    "description": "A simple napkin"
}
```

#### PATCH increase item quantity

By specifying the item ID, you can increase its quantity.
To input ID please refer to the ID field in the Path Variables.
ID should look like this:

```bash
66ba4304b0121af47a632d0a
```

#### PATCH decrease item quantity

By specifying the item ID, you can decrease its quantity. If quantity reaches 0 - the item is removed from the drawer.
To input ID please refer to the ID field in the Path Variables.
ID should look like this:

```bash
66ba4304b0121af47a632d0a
```

#### DEL remove item

Specify the item ID you want to remove and it will be removed from the drawer.
To input ID please refer to the ID field in the Path Variables.
ID should look like this:

```bash
66ba4304b0121af47a632d0a
```


Note: All relevant outputs will show you item IDs and your drawer ID. You can use those for GET methods.
