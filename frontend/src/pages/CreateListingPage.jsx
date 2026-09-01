import { Container } from '@mui/material'
import PetForm from '../components/pet/PetForm'

const CreateListingPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <PetForm isEdit={false} />
    </Container>
  )
}

export default CreateListingPage
