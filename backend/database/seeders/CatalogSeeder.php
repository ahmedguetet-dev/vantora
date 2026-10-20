<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /** Product tuple: [name, brand, price in cents, short blurb] */
    private function catalog(): array
    {
        return [
            ['name' => 'Audio', 'description' => 'Headphones, earbuds and speakers tuned for everyday listening.', 'products' => [
                ['Aurelia Wireless Headphones', 'Sonora', 24900, 'Plush over-ear comfort with a 40-hour battery.'],
                ['Nimbus ANC Earbuds', 'Sonora', 15900, 'Adaptive noise cancelling in a pocketable case.'],
                ['Meridian Bookshelf Speakers', 'Halden Audio', 32900, 'Warm, detailed stereo sound for any shelf.'],
                ['Pebble Portable Speaker', 'Halden Audio', 8900, 'Waterproof Bluetooth speaker with 18 hours of play.'],
                ['Vinyl Studio Turntable', 'Halden Audio', 27900, 'Belt-drive turntable with a built-in preamp.'],
                ['Cadence Sport Earbuds', 'Sonora', 7900, 'Secure-fit earbuds that survive sweat and rain.'],
                ['Orbit Desktop Soundbar', 'Halden Audio', 11900, 'Compact soundbar that fills a desk with clear sound.'],
                ['Quill USB Condenser Microphone', 'Voxa', 12900, 'Studio-quality voice capture for calls and podcasts.'],
            ]],
            ['name' => 'Wearables', 'description' => 'Smartwatches and trackers that stay out of the way.', 'products' => [
                ['Lumen Smartwatch Series 2', 'Kairo', 29900, 'AMOLED display, heart-rate and sleep tracking.'],
                ['Pulse Fitness Band', 'Kairo', 6900, 'Slim band with 14-day battery and workout modes.'],
                ['Halo Sleep Ring', 'Kairo', 24900, 'Titanium ring that tracks sleep and recovery.'],
                ['Trek GPS Watch', 'Kairo', 37900, 'Multi-band GPS built for trails and long runs.'],
                ['Sleeve Leather Watch Strap', 'Tanner & Co', 3900, 'Vegetable-tanned leather strap, quick-release pins.'],
                ['Vita Smart Scale', 'Kairo', 5900, 'Body composition scale that syncs with your phone.'],
                ['Echo Open-Ear Clips', 'Sonora', 13900, 'Open-ear audio that keeps you aware of your surroundings.'],
            ]],
            ['name' => 'Home Office', 'description' => 'Furniture and gear for a comfortable, focused workspace.', 'products' => [
                ['Ascent Electric Standing Desk', 'Fjord Works', 54900, 'Dual-motor desk with four memory height presets.'],
                ['Ergo Mesh Chair Pro', 'Fjord Works', 42900, 'Breathable mesh chair with adjustable lumbar support.'],
                ['Lumen Monitor Light Bar', 'Lumen Lab', 5900, 'Asymmetric light that cuts glare on your screen.'],
                ['Halcyon Monitor Arm', 'Fjord Works', 9900, 'Gas-spring arm with smooth, tool-free adjustment.'],
                ['Slate Desk Mat XL', 'Tanner & Co', 4500, 'Water-resistant felt mat for keyboard and mouse.'],
                ['Anchor Laptop Stand', 'Fjord Works', 4900, 'Machined aluminium stand that lifts your screen.'],
                ['Beacon Ergonomic Footrest', 'Fjord Works', 5500, 'Tilting footrest that eases long sitting days.'],
                ['Folio Cable Management Tray', 'Fjord Works', 2900, 'Under-desk tray that hides cables and power bricks.'],
            ]],
            ['name' => 'Keyboards & Mice', 'description' => 'Precision input devices for work and play.', 'products' => [
                ['Atlas 75% Mechanical Keyboard', 'Keyforge', 16900, 'Hot-swappable switches in a gasket-mounted frame.'],
                ['Drift Low-Profile Keyboard', 'Keyforge', 12900, 'Slim wireless keyboard with quiet, tactile keys.'],
                ['Glide Wireless Mouse', 'Keyforge', 7900, 'Silent clicks and a 90-day battery.'],
                ['Contour Vertical Mouse', 'Keyforge', 6900, 'Vertical grip that reduces wrist strain.'],
                ['Orbit Trackball', 'Keyforge', 9900, 'Thumb-operated trackball for tight desk spaces.'],
                ['Switch Tester Kit', 'Keyforge', 1900, 'Twenty-four switches to find your favourite feel.'],
                ['Palm Rest Walnut', 'Tanner & Co', 3500, 'Hand-finished walnut wrist rest, oil-sealed.'],
                ['Pad Pro Large Mousepad', 'Tanner & Co', 2900, 'Stitched-edge pad with a low-friction surface.'],
            ]],
            ['name' => 'Travel', 'description' => 'Carry-ons, organisers and accessories for lighter journeys.', 'products' => [
                ['Voyager 40L Carry-On Backpack', 'Northbound', 18900, 'Airline-friendly pack with a clamshell opening.'],
                ['Transit Hardshell Carry-On', 'Northbound', 24900, 'Polycarbonate shell with silent spinner wheels.'],
                ['Pack Cube Set', 'Northbound', 3900, 'Three compression cubes that keep bags organised.'],
                ['Passport Wallet Leather', 'Tanner & Co', 5900, 'Slim RFID-blocking wallet for documents and cards.'],
                ['Universal Travel Adapter', 'Voltis', 3400, 'One adapter for 150+ countries with USB-C ports.'],
                ['Compression Travel Pillow', 'Northbound', 2900, 'Packs down to the size of a water bottle.'],
                ['Dopp Toiletry Bag', 'Northbound', 4900, 'Wipe-clean bag with a hanging hook.'],
                ['Tracker Tag 4-Pack', 'Kairo', 8900, 'Find keys and bags with precision location.'],
            ]],
            ['name' => 'Power & Charging', 'description' => 'Fast, compact charging for every device you carry.', 'products' => [
                ['Gridline 140W GaN Charger', 'Voltis', 7900, 'Charges a laptop and phone at full speed.'],
                ['Magnetic Wireless Charger Stand', 'Voltis', 4900, 'Snap-on charging stand with adjustable angle.'],
                ['Core 20,000mAh Power Bank', 'Voltis', 6900, 'Airline-safe power bank with 65W output.'],
                ['Braided USB-C Cable 2m', 'Voltis', 1900, 'Durable braided cable rated for 240W.'],
                ['Dock 3-in-1 Charging Station', 'Voltis', 9900, 'Charges phone, watch and earbuds on one base.'],
                ['Surge Smart Power Strip', 'Voltis', 5900, 'Six outlets, four USB ports, surge protection.'],
                ['Solar Pocket Charger', 'Voltis', 7900, 'Foldable solar panel for days off the grid.'],
            ]],
            ['name' => 'Smart Home', 'description' => 'Thoughtful devices that make a home calmer and more efficient.', 'products' => [
                ['Hearth Smart Thermostat', 'Casabel', 17900, 'Learns your schedule and trims your energy bill.'],
                ['Glow Smart Bulb 4-Pack', 'Casabel', 4900, 'Tunable white and colour bulbs with scenes.'],
                ['Sentry Indoor Camera', 'Casabel', 6900, '2K camera with privacy shutter and night vision.'],
                ['Ember Smart Plug 4-Pack', 'Casabel', 3900, 'Schedule and monitor appliances from your phone.'],
                ['Dawn Wake-Up Light Alarm', 'Casabel', 8900, 'Sunrise simulation for gentler mornings.'],
                ['Whisper Air Purifier', 'Casabel', 19900, 'Quiet HEPA purifier for rooms up to 40 square metres.'],
                ['Hub Mini Smart Hub', 'Casabel', 5900, 'Connects your devices in one simple app.'],
            ]],
            ['name' => 'Lifestyle', 'description' => 'Everyday objects that are a pleasure to use.', 'products' => [
                ['Tide Insulated Bottle 750ml', 'Northbound', 3900, 'Keeps drinks cold for 24 hours, hot for 12.'],
                ['Brew Pour-Over Coffee Set', 'Fjord Works', 7900, 'Ceramic dripper, glass server and reusable filter.'],
                ['Ritual Aromatherapy Diffuser', 'Casabel', 5500, 'Ultrasonic diffuser with ambient light.'],
                ['Journal Linen Notebook', 'Tanner & Co', 2400, 'Lay-flat linen notebook with 160 dotted pages.'],
                ['Everyday Leather Card Holder', 'Tanner & Co', 4900, 'Minimal card holder in full-grain leather.'],
                ['Slate Ceramic Mug Set', 'Fjord Works', 4200, 'Set of four stoneware mugs with a matte glaze.'],
                ['Haven Wool Throw Blanket', 'Fjord Works', 8900, 'Soft merino blend throw in a herringbone weave.'],
            ]],
        ];
    }

    public function run(): void
    {
        $n = 0;

        foreach ($this->catalog() as $index => $group) {
            $category = Category::create([
                'name' => $group['name'],
                'slug' => Str::slug($group['name']),
                'description' => $group['description'],
                'image' => 'https://picsum.photos/seed/cat-'.Str::slug($group['name']).'/800/600',
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            foreach ($group['products'] as [$name, $brand, $price, $blurb]) {
                $slug = Str::slug($name);
                $stock = $n % 11 === 5 ? random_int(0, 4) : random_int(8, 120);

                $product = Product::create([
                    'category_id' => $category->id,
                    'name' => $name,
                    'slug' => $slug,
                    'sku' => sprintf('VAN-%s-%03d', strtoupper(substr($category->slug, 0, 3)), $n + 1),
                    'description' => "{$name} by {$brand}. {$blurb} Designed to look good, work hard and last for years.",
                    'price_cents' => $price,
                    'compare_at_cents' => $n % 4 === 1 ? (int) (round($price * 1.2 / 100) * 100) : null,
                    'stock' => $stock,
                    'low_stock_threshold' => 5,
                    'brand' => $brand,
                    'rating_avg' => round(random_int(380, 500) / 100, 2),
                    'rating_count' => random_int(5, 400),
                    'is_active' => true,
                    'is_featured' => $n % 5 === 0,
                ]);

                foreach (range(1, 3) as $i) {
                    $product->images()->create([
                        'url' => "https://picsum.photos/seed/{$slug}-{$i}/900/900",
                        'alt' => "{$name} - view {$i}",
                        'sort_order' => $i,
                    ]);
                }

                StockMovement::create([
                    'product_id' => $product->id,
                    'delta' => $stock,
                    'reason' => 'initial_stock',
                ]);

                $n++;
            }
        }
    }
}