{
    async function refreshTable(root) {
        // console.log("Table refreshed!");

        const table = root.querySelector(".table-logTable");
        const response = await fetch(root.dataset.url).catch(function(error) {
            console.log(error);
        });
        const logData = await response.json();

        //Clear table
        table.querySelector("thead tr").innerHTML = "";
        table.querySelector("tbody").innerHTML = "";

        //Populate headers
        for (const header of logData.headers) {
            table.querySelector("thead tr").insertAdjacentHTML("beforeend", `<th>${ header }</th>`);
        }

        //Populate rows
        for (const row of logData.rows) {
            table.querySelector("tbody").insertAdjacentHTML("beforeend", `
                <tr>
                    ${ row.map(col => `<td>${ col }</td>`).join("") }               
                </tr>
            `);
        }
    }

    for (const root of document.querySelectorAll(".logTable[data-url]")) {
        const btnRefreshLog = document.getElementById('btnRefreshLog');
        const table = document.createElement("table");
        table.classList.add("w3-table-all");
        table.classList.add("w3-gray");
        table.classList.add("table-logTable");

        table.innerHTML = `
            <thead>
                <tr class="w3-light-gray"></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Seznam je prázdny</td>
                </tr>
            </tbody>
        `;

        root.append(table);

        btnRefreshLog.addEventListener('click', function (e) {
            console.log('Button clicked!');
            refreshTable(root);
        });

        refreshTable(root);
    }
}