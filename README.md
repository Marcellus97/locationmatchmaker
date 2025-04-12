# dva-Project




## Running the D3 Visualization

This guide explains how to clone the repository and run the **d3-viz** application on both **Windows** and **Linux** (or **WSL**). After following these steps, you’ll have a local development server running your D3-based visualizations in the browser.

---

### Prerequisites

- **Git**: to clone the repository.
- **Node.js** (includes `npm`): to install and manage dependencies.

You can verify if you have these tools by running:
```_bash_
git --version
node -v
npm -v
```

### Step-By-Step Guide (Windows/Linux)

#### 1. Clone the Repository
Open your terminal (PowerShell/Command Prompt in Windows; _bash_ in Linux/WSL) and clone the repo:


``` _bash_
git clone https://github.gatech.edu/snima3/dva-Project.git
```

Then navigate into the newly cloned directory. If your project structure has the d3-viz folder, for example:

``` _bash_
cd dva-Project/d3-viz
```

#### 2. Install Dependencies
Inside the `d3-viz` folder, install all Node.js dependencies:

``` _bash_
npm install
```
This command looks at the `package.json` file and downloads everything needed into a `node_modules` folder.

#### 3. Start the Local Server
Once installation is complete, start the development server with:

``` _bash_
npm start
```
This launches a lightweight HTTP server (via `http-server`) serving the current directory on a default port (often `8080`).

#### 4. View the Visualization
Open your browser and navigate to:

http://localhost:8080

If your `index.html` is in the root of `d3-viz`, you should see your D3 visualization. If you’re using additional HTML files, be sure to point your browser to the correct path (e.g., http://localhost:8080/anotherPage.html).

#### 5. Editing the Code
The main entry point is typically `index.html` within the `d3-viz` folder.

`main.js` contains your D3 JavaScript code.

`styles.css` (or any other CSS file) handles your custom styling.

You can also take advantage of _Bootstrap_ or _Tailwind_ for a more polished layout.

As you save changes, just refresh your browser to see them. If you want live-reloading, consider using live-server or another dev tool.


### Windows vs. Linux/WSL
#### Windows:

Open PowerShell or Command Prompt in the d3-viz folder and run:

``` _bash_
npm install
npm start
```
Navigate to http://localhost:8080 in your browser.

#### Linux / WSL:

In your __bash__ (Ubuntu, etc.), run the same commands inside the project folder:

``` _bash_
npm install
npm start
```
Then open http://localhost:8080 in a browser. You can use a Windows browser even when running Node in WSL.

In most cases, there’s no difference in how you run this app on different platforms—just make sure you’re in the right directory when installing or starting.

##### Troubleshooting
- Port Already in Use
    - If http-server errors out with “Address already in use,” specify a different port:

``` _bash_
npx http-server . -p 3000
```
Then visit http://localhost:3000.

- Permission Errors (Linux/WSL)

    - If you get permission denied errors, you might need to adjust file ownership with chown or temporarily use sudo (though this is rarely necessary if your permissions are correct).