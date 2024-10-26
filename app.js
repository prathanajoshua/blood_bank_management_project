document.addEventListener("DOMContentLoaded", () => {
    // Donor form submission handler
    const donorForm = document.getElementById("donorForm");
    if (donorForm) {
        donorForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const donorData = {
                name: document.getElementById("name").value.trim(),
                bloodType: document.getElementById("bloodType").value.trim(),
                contact: document.getElementById("contact").value.trim(),
                location: document.getElementById("location").value.trim()
            };

            fetch("http://localhost:5000/api/donors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(donorData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message); // Display success message
                // Update inventory display
                updateInventoryDisplay(data.inventory);
            })
            .catch(error => alert("Error: " + error));

            donorForm.reset();
        });
    }

    // Recipient form submission handler
    const recipientForm = document.getElementById("recipientForm");
    if (recipientForm) {
        recipientForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const recipientData = {
                name: document.getElementById("rname").value.trim(),
                bloodType: document.getElementById("rbloodType").value.trim(),
                contact: document.getElementById("rcontact").value.trim(),
                location: document.getElementById("rlocation").value.trim()
            };

            fetch("http://localhost:5000/api/recipients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(recipientData)
            })
            .then(response => response.text())
            .then(data => alert(data))
            .catch(error => alert("Error: " + error));

            recipientForm.reset();
        });
    }

    // Donation form submission handler
    const donationForm = document.getElementById("donationForm");
    if (donationForm) {
        donationForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const donationData = {
                donorId: document.getElementById("donorId").value.trim(),
                quantity: parseInt(document.getElementById("quantity").value.trim())
            };

            fetch("http://localhost:5000/api/donations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(donationData)
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                fetchDonations(); // Fetch updated donation records after submission
            })
            .catch(error => alert("Error: " + error));

            donationForm.reset();
        });
    }

    // Fetch and display donation records
    function fetchDonations() {
        fetch("http://localhost:5000/api/donations")
        .then(response => response.json())
        .then(data => updateDonationRecords(data))
        .catch(error => console.error("Error fetching donation records:", error));
    }

    // Update donation records display
    function updateDonationRecords(donations) {
        const recordsList = document.getElementById("recordsList");
        recordsList.innerHTML = ""; // Clear previous records

        donations.forEach(donation => {
            const div = document.createElement("div");
            div.textContent = `Donor: ${donation.donorId.name} (Blood Type: ${donation.donorId.bloodType}), Quantity: ${donation.quantity} units, Date: ${new Date(donation.date).toLocaleDateString()}`;
            recordsList.appendChild(div);
        });
    }

    // Fetch and display inventory
    function updateInventoryDisplay(inventory) {
        const inventoryElement = document.getElementById("inventory");
        inventoryElement.innerHTML = ""; // Clear previous inventory

        inventory.forEach(item => {
            const div = document.createElement("div");
            div.textContent = `${item._id}: ${item.count}`; // Use backticks for template literal
            inventoryElement.appendChild(div);
        });
    }

    // Fetch initial inventory on page load
    function fetchInventory() {
        fetch("http://localhost:5000/api/inventory")
        .then(response => response.json())
        .then(data => updateInventoryDisplay(data))
        .catch(error => console.error("Error fetching inventory:", error));
    }

    // Fetch initial donation records on page load
    fetchDonations();
    fetchInventory();
});
