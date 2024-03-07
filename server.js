const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.get('/:formId/filteredResponses', async (req, res) => {
    try {
        const formId = req.params.formId;
        const apiKey = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
        const filters = JSON.parse(req.query.filters);

        const filloutResponse = await axios.get(`https://api.fillout.com/v1/api/forms/${formId}/submissions`, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });

        const filteredResponses = filloutResponse.data.responses.filter(response => {
            // Check if every filter condition is satisfied
            return filters.every(filter => {
                const question = response.questions.find(q => q.id === filter.id);
                if (question) {
                    switch (filter.condition) {
                        case 'equals':
                            return question.value === filter.value;
                        case 'does_not_equal':
                            return question.value !== filter.value;
                        case 'greater_than':
                            return new Date(question.value) > new Date(filter.value);
                        case 'less_than':
                            return new Date(question.value) < new Date(filter.value);
                        default:
                            return false;
                    }
                }
                return false;
            });
        });
        
        const totalResponses = filteredResponses.length;
        const pageCount = Math.ceil(totalResponses / filloutResponse.data.pageCount);

        const responseObj = {
            responses: filteredResponses,
            totalResponses: totalResponses,
            pageCount: pageCount
        };

        res.json(responseObj);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
