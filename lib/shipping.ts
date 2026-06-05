/** Bangladesh districts (64). Used for the address form + shipping calc. */
export const DISTRICTS = [
  "Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria",
  "Chandpur","Chapainawabganj","Chattogram","Chuadanga","Cox's Bazar","Cumilla",
  "Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj",
  "Habiganj","Jamalpur","Jashore","Jhalokati","Jhenaidah","Joypurhat","Khagrachhari",
  "Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur",
  "Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon",
  "Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali",
  "Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati",
  "Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet",
  "Tangail","Thakurgaon",
] as const;

const FREE_SHIPPING_THRESHOLD = 3000; // ৳ — free delivery over this subtotal

/** Flat shipping: ৳60 inside Dhaka, ৳120 elsewhere; free over threshold. */
export function shippingFee(district: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return district.trim().toLowerCase() === "dhaka" ? 60 : 120;
}
