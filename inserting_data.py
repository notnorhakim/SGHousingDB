import mysql.connector
from mysql.connector import Error
from tqdm import tqdm  # Import tqdm for the progress bar
import pandas as pd


print("Script started")

try:
    # Establish a connection to your MySQL database
    print("Attempting to connect to the MySQL database...")

    conn = mysql.connector.connect(
        host="localhost",         # MySQL server host
        user="root",              # Your MySQL username
        password="#H@hs12499",    # Your MySQL password
        database="SingaporeResale"  # Your database name
    )

    print("Connection attempt made.")

    # If the connection is successful, print a success message
    if conn.is_connected():
        print("Successfully connected to the database")

        # Create a cursor to interact with MySQL
        cursor = conn.cursor()
        print("read")
        # Load the CSV file into a pandas DataFrame
        df = pd.read_csv('./cleaned.csv')
        

        # Insert data into the Location table if the town and street_name are not already present
        for row in tqdm(df.itertuples(index=False), total=len(df), desc="Inserting into Location", unit="row"):
            cursor.execute("""
                INSERT IGNORE INTO Location (town, street_name)
                VALUES (%s, %s)
            """, (row.town, row.street_name))

        # Retrieve location_id for each town and street_name combination
        for row in tqdm(df.itertuples(index=False), total=len(df), desc="Inserting into Flats, Lease, and Resale", unit="row"):
            cursor.execute("""
                SELECT location_id FROM Location 
                WHERE town = %s AND street_name = %s
            """, (row.town, row.street_name))
            location_id = cursor.fetchone()[0]

            # Insert data into Flats table
            cursor.execute("""
                INSERT INTO Flats (flat_type, block, storey_range, flat_model, location_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (row.flat_type, row.block, row.storey_range, row.flat_model, location_id))

            # Insert data into Lease table using the last inserted flat_id
            flat_id = cursor.lastrowid
            cursor.execute("""
                INSERT INTO Lease (flat_id, lease_commence_date, remaining_lease)
                VALUES (%s, %s, %s)
            """, (flat_id, row.lease_commence_date, row.remaining_lease))

            # Insert data into Resale table using the last inserted flat_id
            cursor.execute("""
                INSERT INTO Resale (flat_id, month, resale_price)
                VALUES (%s, %s, %s)
            """, (flat_id, row.month, row.resale_price))

        # Commit the transactions
        conn.commit()

        print("Data has been successfully inserted into the database.")

        # Close the cursor and connection
        cursor.close()

except mysql.connector.Error as e:
    # If there's an error, print the error message
    print(f"Error: {e}")
    print("The script will now exit due to the connection error.")

finally:
    # Ensure the connection is closed if it was established
    if conn.is_connected():
        print("Closing the connection.")
        conn.close()
        print("Connection closed")


# The second print statement will execute regardless of success or failure
print("Script completed")
