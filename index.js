document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById("web");

  // Fetch the JSON data
  fetch('data.json')
      .then(response => response.json())
      .then(data => {
          const categories = data.Apps.Categories;

          // Generate the HTML for categories and apps
          for (const category of categories) {
              for (const key in category) {
                  const categoryData = category[key];
                  
                  // Create category name element
                  const categoryDiv = document.createElement("div");
                  categoryDiv.className = "category-name";
                  categoryDiv.textContent = categoryData.Name;
                  
                  // Create list-category container
                  const listCategoryDiv = document.createElement("div");
                  listCategoryDiv.className = "list-category";
                  
                  // Loop through the apps in each category
                  for (const appKey in categoryData.Apps[0]) {
                      const appData = categoryData.Apps[0][appKey];
                      
                      // Create list-item container
                      const listItemDiv = document.createElement("div");
                      listItemDiv.className = "list-item";
                      listItemDiv.id = appData.Cmd;
                      
                      // Create row for the app icon
                      const rowDiv = document.createElement("div");
                      rowDiv.className = "row";
                      
                      const img = document.createElement("img");
                      img.src = appData.Icon;
                      rowDiv.appendChild(img);
                      
                      // Create col for the app details
                      const colDiv = document.createElement("div");
                      colDiv.className = "col";
                      
                      const itemNameDiv = document.createElement("div");
                      itemNameDiv.className = "item-name";
                      itemNameDiv.textContent = appData.Name;
                      
                      const itemDescriptionDiv = document.createElement("div");
                      itemDescriptionDiv.className = "item-description";
                      itemDescriptionDiv.textContent = appData.Description;
                      
                      colDiv.appendChild(itemNameDiv);
                      colDiv.appendChild(itemDescriptionDiv);
                      
                      // Append row and col to the list item
                      listItemDiv.appendChild(rowDiv);
                      listItemDiv.appendChild(colDiv);
                      
                      // Append list item to the list category container
                      listCategoryDiv.appendChild(listItemDiv);
                  }
                  
                  // Append category name and list-category to the main list container
                  list.appendChild(categoryDiv);
                  list.appendChild(listCategoryDiv);
              }
          }

          // Handle selection and file generation
          const listItems = document.querySelectorAll('.list-item');
          let selectedCommands = [];
          let selectedApps = [];

          listItems.forEach(item => {
              item.addEventListener('click', () => {
                  // Toggle the selected class
                  item.classList.toggle('selected');

                  // Update the selected commands array
                  const command = item.id;
                  const app = item.querySelector(".item-name").textContent;
                  if (item.classList.contains('selected')) {
                      selectedCommands.push(command + " -y");
                      selectedApps.push(app);
                  } else {
                      selectedCommands = selectedCommands.filter(cmd => cmd !== command);
                      selectedApps = selectedApps.filter(apk => apk !== app);
                  }

                  // Log the selected commands
                  console.log('Selected Commands:', selectedCommands);
                  console.log('Selected Apps:', selectedApps);
              });
          });

          // Function to generate install.sh file content
          function generateShellScript() {
              return selectedCommands.join('\n') + '\n';
          }

          // Function to generate install.desktop file content
          function generateDesktopFile() {
              return `[Desktop Entry]
Name=Install Applications
Comment=Run the installation script
Exec=gnome-terminal -- bash -c "cd $(dirname $(realpath %k)) && chmod +x install.sh && ./install.sh; exec bash"
Icon=utilities-terminal
Terminal=false
Type=Application
`;
          }

          // Function to zip and download files
          async function zipAndDownload() {
              const JSZip = window.JSZip;
              const zip = new JSZip();
              
              // Add files to the zip
              zip.file('install.sh', generateShellScript());
              zip.file('install.desktop', generateDesktopFile());
              
              // Generate zip file
              try {
                  if (selectedApps.length != 0) {
                      const zipBlob = await zip.generateAsync({ type: 'blob' });
                      
                      // Create a download link and trigger the download
                      const downloadLink = document.createElement('a');
                      downloadLink.href = URL.createObjectURL(zipBlob);
                      const name1 = selectedApps.join('-');
                      const name2 = name1.replace(' ', '-','-');
                      downloadLink.download = selectedApps.join(" ").split(' ').join('-') + '.zip';
                      downloadLink.click();
                      
                      // Clean up the URL object
                      URL.revokeObjectURL(downloadLink.href);
                  }
              } catch (error) {
                  console.error('Error generating zip file:', error);
              }
          }

          // Add a button to generate the zip file
          const generateButton = document.getElementById('gen');
          generateButton.addEventListener('click', zipAndDownload);
      })
      .catch(error => {
          console.error('Error fetching JSON data:', error);
      });
});
