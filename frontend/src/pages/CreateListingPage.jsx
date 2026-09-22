import { Container } from '@mui/material'
import PetForm from '../components/pet/PetForm'
import BackButton from '../components/ui/BackButton'

const CreateListingPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <BackButton fallbackPath="/my-listings" label="ย้อนกลับ" />
      <PetForm isEdit={false} />
    </Container>
  )
}

export default CreateListingPage
