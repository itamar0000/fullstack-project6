export function rowToUser(r) {
  return {
    id: r.id,
    name: r.name,
    username: r.username,
    email: r.email,
    phone: r.phone,
    website: r.website,
    isAdmin: !!r.is_admin,
    isBlocked: !!r.is_blocked,
    address: {
      street: r.street,
      suite: r.suite,
      city: r.city,
      zipcode: r.zipcode,
    },
    company: {
      name: r.company_name,
      catchPhrase: r.company_catchphrase,
      bs: r.company_bs,
    },
  };
}
