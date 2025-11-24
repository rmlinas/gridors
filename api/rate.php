<?php
// Nustatome antraštę, kad atsakymas būtų JSON formatu
header('Content-Type: application/json');

// Nustatome CORS antraštę, kad Astro frontend'as galėtų siųsti užklausas.
// Produkcijoje PAKEISKITE '*' į tikrąjį jūsų frontend domeno pavadinimą!
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Jei užklausa yra OPTIONS (naudojama CORS preflight), tiesiog grąžiname sėkmę
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// MySQL prisijungimo duomenys
// Pakeiskite šias reikšmes, jei jūsų .env faile nurodyti kitokie duomenys
$servername = "localhost"; // Arba jūsų MySQL serverio IP/adresas
$username = "fafwdmnuwg";
$password = "QD6MYXU4p7";
$dbname = "fafwdmnuwg";

// Prisijungimas prie duomenų bazės
$conn = new mysqli($servername, $username, $password, $dbname);

// Patikrinimas, ar prisijungimas sėkmingas
if ($conn->connect_error) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['message' => 'Database connection failed: ' . $conn->connect_error]);
    exit();
}

// Tikriname, ar užklausa yra POST metodas
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input'); // Gauname POST užklausos turinį
    $data = json_decode($input, true); // Dekoduojame JSON į PHP masyvą

    $slug = $data['slug'] ?? '';
    $rating = $data['rating'] ?? 0;

    // Validavimas: patikriname gautus duomenis
    if (empty($slug) || !is_string($slug) || !is_numeric($rating) || $rating < 1 || $rating > 5) {
        http_response_code(400); // Bad Request
        echo json_encode(['message' => 'Neteisingi duomenys. Įvertinimas turi būti skaičius nuo 1 iki 5, ir slug negali būti tuščias.']);
        $conn->close();
        exit();
    }

    // Įvertinimo įrašymas į DB naudojant parengtą užklausą (prepared statement) saugumui užtikrinti
    $stmt = $conn->prepare("INSERT INTO reviews_ratings (review_slug, rating) VALUES (?, ?)");
    // "si" reiškia, kad pirmas kintamasis yra string (s), antras - integer (i)
    $stmt->bind_param("si", $slug, $rating);

    if ($stmt->execute()) {
        // Įrašymas sėkmingas, dabar apskaičiuojame naują vidutinį įvertinimą
        $stmt->close(); // Uždaryti dabartinę užklausą

        $avgStmt = $conn->prepare("SELECT AVG(rating) as average_rating, COUNT(rating) as total_ratings FROM reviews_ratings WHERE review_slug = ?");
        $avgStmt->bind_param("s", $slug);
        $avgStmt->execute();
        $result = $avgStmt->get_result();
        $row = $result->fetch_assoc(); // Gauname rezultatą

        $averageRating = $row['average_rating'] ? round((float)$row['average_rating'], 1) : $rating; // Apvaliname iki 1 skaičiaus po kablelio
        $totalRatings = $row['total_ratings'] ?? 1; // Jei nėra įvertinimų, pradedame nuo 1

        http_response_code(200); // OK
        echo json_encode([
            'message' => 'Įvertinimas išsaugotas sėkmingai!',
            'receivedRating' => $rating,
            'newAverageRating' => $averageRating,
            'totalRatings' => $totalRatings,
            'slug' => $slug
        ]);

    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['message' => 'Nepavyko išsaugoti įvertinimo: ' . $stmt->error]);
    }

    $stmt->close(); // Uždaryti parengtą užklausą, jei ji dar neuždaryta
} else {
    // Neleistini užklausos metodai (leidžiame tik POST)
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => 'Method not allowed. Only POST requests are accepted.']);
}

$conn->close(); // Uždaryti duomenų bazės prisijungimą
?>